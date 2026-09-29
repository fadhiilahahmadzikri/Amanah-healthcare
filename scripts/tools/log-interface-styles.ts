export const LOG_INTERFACE_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #09090b; --surface: #121215; --card: #18181b; --border: #27272a; --border-subtle: #1f1f23;
      --fg: #fafafa; --muted: #71717a; --muted-fg: #a1a1aa; --primary: #10b981;
      --method-get: #3b82f6; --method-post: #10b981; --method-put: #f59e0b; --method-del: #ef4444;
      --status-2xx: #10b981; --status-3xx: #60a5fa; --status-4xx: #f59e0b; --status-5xx: #ef4444;
    }
    body {
      background-color: var(--bg); color: var(--fg);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      height: 100vh; overflow: hidden; display: flex; flex-direction: column; font-size: 12px; user-select: none;
    }
    header {
      height: 44px; border-bottom: 1px solid var(--border); background: var(--surface);
      display: flex; align-items: center; justify-content: space-between; padding: 0 12px; gap: 12px; flex-shrink: 0;
    }
    .left-controls, .right-controls { display: flex; align-items: center; gap: 8px; }
    .live-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--primary);
      box-shadow: 0 0 8px var(--primary); animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .file-badge {
      font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 3px 8px;
      background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--muted-fg);
    }
    .icon-btn {
      width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
      background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--muted-fg);
      cursor: pointer; transition: all 0.15s ease;
    }
    .icon-btn:hover { background: #27272a; color: var(--fg); border-color: #3f3f46; }
    .icon-btn.active { background: #27272a; color: var(--primary); border-color: var(--primary); }
    .search-input {
      background: var(--card); border: 1px solid var(--border); color: var(--fg); padding: 4px 10px;
      border-radius: 6px; font-size: 11.5px; font-family: 'JetBrains Mono', monospace; width: 190px;
      outline: none; transition: border-color 0.15s;
    }
    .search-input:focus { border-color: #52525b; }
    .filter-pills { display: flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
    .filter-pill {
      background: var(--card); border: none; color: var(--muted-fg); padding: 4px 9px;
      font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 600;
      cursor: pointer; border-right: 1px solid var(--border); transition: background 0.15s;
    }
    .filter-pill:last-child { border-right: none; }
    .filter-pill.active { background: #27272a; color: var(--fg); }
    main { flex: 1; display: flex; overflow: hidden; position: relative; }
    .log-list { flex: 1; overflow-y: auto; background: var(--bg); display: flex; flex-direction: column; }
    .log-row {
      display: flex; align-items: center; gap: 12px; padding: 7px 12px;
      border-bottom: 1px solid var(--border-subtle); font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px; cursor: pointer; transition: background 0.1s;
    }
    .log-row:hover { background: var(--surface); }
    .log-row.selected { background: #18181b; border-left: 2px solid var(--primary); }
    .method {
      font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px;
      width: 48px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .method-get { background: rgba(59, 130, 246, 0.12); color: var(--method-get); }
    .method-post { background: rgba(16, 185, 129, 0.12); color: var(--method-post); }
    .method-put { background: rgba(245, 158, 11, 0.12); color: var(--method-put); }
    .method-delete { background: rgba(239, 68, 68, 0.12); color: var(--method-del); }
    .status { font-weight: 700; font-size: 11px; width: 32px; text-align: right; }
    .status-2xx { color: var(--status-2xx); }
    .status-3xx { color: var(--status-3xx); }
    .status-4xx { color: var(--status-4xx); }
    .status-5xx { color: var(--status-5xx); }
    .path { flex: 1; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .duration { color: var(--muted-fg); font-size: 10.5px; width: 55px; text-align: right; }
    .time { color: var(--muted); font-size: 10.5px; width: 70px; text-align: right; }
    .detail-pane {
      width: 480px; background: var(--surface); border-left: 1px solid var(--border);
      display: flex; flex-direction: column; height: 100%; overflow: hidden; transition: width 0.2s ease;
    }
    .detail-pane.closed { display: none; }
    .detail-header {
      height: 40px; border-bottom: 1px solid var(--border); padding: 0 12px;
      display: flex; align-items: center; justify-content: space-between; background: var(--card);
    }
    .detail-tabs { display: flex; gap: 4px; }
    .detail-tab {
      background: transparent; border: none; color: var(--muted-fg); padding: 4px 10px;
      border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;
    }
    .detail-tab.active { background: #27272a; color: var(--fg); }
    .detail-content {
      flex: 1; overflow-y: auto; padding: 12px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.5;
    }
    pre {
      background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
      padding: 10px; overflow-x: auto; color: #e4e4e7; white-space: pre-wrap; word-break: break-all;
    }
    .copy-btn { position: absolute; top: 8px; right: 8px; }
    .json-key { color: #93c5fd; }
    .json-str { color: #86efac; }
    .json-num { color: #fde047; }
    .json-bool { color: #f472b6; }
    .empty-state { padding: 60px 20px; text-align: center; color: var(--muted); font-size: 12px; }
`;
