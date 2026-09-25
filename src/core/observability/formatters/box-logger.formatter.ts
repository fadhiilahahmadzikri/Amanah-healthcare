import type {
  HttpRequestEvent,
  HttpResponseEvent,
  HttpErrorEvent
} from '../models/http-event.types';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
};

const BORDER_WIDTH = 68;

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function formatBox(title: string, fields: Record<string, unknown>): string {
  const visibleTitleLength = stripAnsi(title).length;
  const fillLength = Math.max(2, BORDER_WIDTH - 6 - visibleTitleLength);
  const topBorder = `${ANSI.gray}┌── ${ANSI.reset}${title} ${ANSI.gray}${'─'.repeat(fillLength)}${ANSI.reset}`;

  const lines: string[] = [topBorder];

  for (const [key, val] of Object.entries(fields)) {
    if (val === undefined || val === null) continue;

    let displayVal: unknown = val;

    // If val is a JSON string, parse it so it can be formatted as an indented object
    if (typeof displayVal === 'string') {
      const trimmed = displayVal.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          displayVal = JSON.parse(trimmed);
        } catch {
          // Keep as string if parsing fails
        }
      }
    }

    if (typeof displayVal === 'object' && displayVal !== null) {
      if (Array.isArray(displayVal) && displayVal.length === 0) continue;
      if (
        !Array.isArray(displayVal) &&
        Object.keys(displayVal as Record<string, unknown>).length === 0
      )
        continue;

      lines.push(`${ANSI.gray}│ ${ANSI.reset}${key}:`);
      const jsonLines = JSON.stringify(displayVal, null, 2).split('\n');
      for (const line of jsonLines) {
        lines.push(`${ANSI.gray}│   ${ANSI.reset}${line}`);
      }
    } else {
      const strVal = String(displayVal);
      if (strVal.includes('\n')) {
        lines.push(`${ANSI.gray}│ ${ANSI.reset}${key}:`);
        for (const line of strVal.split('\n')) {
          lines.push(`${ANSI.gray}│   ${ANSI.reset}${line}`);
        }
      } else {
        const label = key.padEnd(12);
        lines.push(`${ANSI.gray}│ ${ANSI.reset}${label}: ${strVal}`);
      }
    }
  }

  const topVisibleLength = 4 + visibleTitleLength + 1 + fillLength;
  const bottomBorderLength = Math.max(BORDER_WIDTH, topVisibleLength);
  lines.push(`${ANSI.gray}└${'─'.repeat(bottomBorderLength)}${ANSI.reset}`);
  return lines.join('\n');
}

export function formatRequestBox(event: HttpRequestEvent): string {
  const title = `${ANSI.cyan}${ANSI.bold}🌐 [HTTP REQUEST] ${event.http.method} ${event.http.path}${ANSI.reset}`;

  let clientDesc: string | undefined = undefined;
  if (event.client.type || event.client.deviceModel || event.client.platform) {
    const parts = [
      event.client.type,
      event.client.platform
        ? `(${event.client.platform}${event.client.deviceModel ? ` / ${event.client.deviceModel}` : ''})`
        : ''
    ].filter(Boolean);
    clientDesc = parts.join(' ');
  }

  return formatBox(title, {
    'Request ID': event.requestId,
    Client: clientDesc,
    IP: event.ip?.ip ? `${event.ip.ip} (${event.ip.source})` : undefined,
    Params: event.http.params,
    Query: event.http.query,
    Headers: event.headers,
    Body: event.body
  });
}

export function formatResponseBox(event: HttpResponseEvent): string {
  const status = event.http.statusCode ?? 200;
  const duration = event.http.durationMs !== undefined ? `(${event.http.durationMs}ms)` : '';

  let icon = '✅';
  let color = ANSI.green;

  if (status >= 500) {
    icon = '❌';
    color = ANSI.red;
  } else if (status >= 400) {
    icon = '⚠️';
    color = ANSI.yellow;
  }

  const title = `${color}${ANSI.bold}${icon} [HTTP RESPONSE] ${status} ${duration} ${event.http.method} ${event.http.path}${ANSI.reset}`;

  return formatBox(title, {
    'Request ID': event.requestId,
    Headers: event.headers,
    Body: event.response
  });
}

export function formatErrorBox(event: HttpErrorEvent): string {
  const status = event.error.statusCode || event.http.statusCode || 500;
  const duration = event.http.durationMs !== undefined ? `(${event.http.durationMs}ms)` : '';

  const title = `${ANSI.red}${ANSI.bold}❌ [HTTP ERROR] ${status} ${duration} ${event.http.method} ${event.http.path}${ANSI.reset}`;

  return formatBox(title, {
    'Request ID': event.requestId,
    Error: event.error.name,
    Message: event.error.message,
    Body: event.error.payload,
    Stack: event.error.stack
  });
}
