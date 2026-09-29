import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { renderLogInterfaceHtml } from './log-interface-ui';

const PORT = Number(process.env.LOG_PORT) || 3333;
const LOG_DIR = path.resolve(process.cwd(), 'logs/http-api');

// Active SSE client connections
const sseClients = new Set<http.ServerResponse>();

function getLatestLogFile(): string | null {
  if (!fs.existsSync(LOG_DIR)) {
    try {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    } catch {
      // Degrade gracefully
    }
    return null;
  }
  const files = fs
    .readdirSync(LOG_DIR)
    .filter((f) => f.endsWith('.log'))
    .sort()
    .reverse();

  return files.length > 0 ? path.join(LOG_DIR, files[0]) : null;
}

// Track file read position for realtime tailing
let activeFilePath = getLatestLogFile();
let lastReadOffset = 0;

if (activeFilePath && fs.existsSync(activeFilePath)) {
  try {
    lastReadOffset = fs.statSync(activeFilePath).size;
  } catch {
    lastReadOffset = 0;
  }
}

// Broadcast new transaction to all active browser SSE streams
function broadcastLog(item: Record<string, unknown>) {
  const payload = `data: ${JSON.stringify(item)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Watch file changes in realtime (250ms polling interval)
setInterval(() => {
  const currentLatest = getLatestLogFile();
  if (!currentLatest) return;

  if (activeFilePath !== currentLatest) {
    activeFilePath = currentLatest;
    lastReadOffset = 0;
    broadcastLog({ activeFile: path.basename(activeFilePath) });
  }

  if (!fs.existsSync(activeFilePath)) return;

  try {
    const stats = fs.statSync(activeFilePath);
    if (stats.size > lastReadOffset) {
      const fd = fs.openSync(activeFilePath, 'r');
      const length = stats.size - lastReadOffset;
      const buffer = Buffer.alloc(length);
      fs.readSync(fd, buffer, 0, length, lastReadOffset);
      fs.closeSync(fd);

      // Guard against reading partial NDJSON lines mid-write
      const lastNewline = buffer.lastIndexOf(10); // ASCII \n
      if (lastNewline === -1) {
        // Complete newline not reached yet, wait for next tick
        return;
      }

      lastReadOffset += lastNewline + 1;
      const completeChunk = buffer.subarray(0, lastNewline).toString('utf8');
      const lines = completeChunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          broadcastLog(parsed);
        } catch {
          // Skip corrupted line
        }
      }
    }
  } catch {
    // Ignore transient read errors
  }
}, 250);

// Keepalive heartbeat every 15s to keep browser SSE connection active
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// Initialize HTTP Server (Compatible with both Bun and Node.js)
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://localhost:${PORT}`);

  // 1. Dashboard UI HTML
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderLogInterfaceHtml());
    return;
  }

  // 2. Initial History for fast hydration
  if (parsedUrl.pathname === '/api/history') {
    const activeFile = getLatestLogFile();
    if (!activeFile || !fs.existsSync(activeFile)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ activeFile: null, items: [] }));
      return;
    }

    try {
      const content = fs.readFileSync(activeFile, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      const recentLines = lines.slice(-100); // Last 100 transactions
      const items = [];
      for (const l of recentLines) {
        try {
          items.push(JSON.parse(l));
        } catch {
          // Ignore corrupted lines
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ activeFile: path.basename(activeFile), items }));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ activeFile: null, items: [] }));
    }
    return;
  }

  // 3. Realtime Server-Sent Events (SSE) stream
  if (parsedUrl.pathname === '/api/live') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    sseClients.add(res);

    // Send current active file name immediately
    const currentFile = getLatestLogFile();
    if (currentFile) {
      res.write(`data: ${JSON.stringify({ activeFile: path.basename(currentFile) })}\n\n`);
    }

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  const banner = `
\x1b[36m┌────────────────────────────────────────────────────────┐\x1b[0m
\x1b[36m│\x1b[0m \x1b[1m🌐 Amanah Real-time API Observability Inspector\x1b[0m        \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                                        \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  • \x1b[32mWatching\x1b[0m   : logs/http-api/                          \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  • \x1b[32mInterface\x1b[0m  : \x1b[4mhttp://localhost:${PORT}\x1b[0m               \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  • \x1b[33mDesign\x1b[0m     : Monotone, Icon-based, Compact           \x1b[36m│\x1b[0m
\x1b[36m└────────────────────────────────────────────────────────┘\x1b[0m
`;
  console.log(banner);
});
