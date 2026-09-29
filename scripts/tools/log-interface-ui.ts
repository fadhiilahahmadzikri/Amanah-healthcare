import { LOG_INTERFACE_STYLES } from './log-interface-styles';

export function renderLogInterfaceHtml(): string {
  return `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Observability Inspector · Amanah</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
${LOG_INTERFACE_STYLES}
  </style>
</head>
<body>
  <header>
    <div class="left-controls">
      <div class="live-dot" title="Real-time Stream Active"></div>
      <span style="font-weight:700;letter-spacing:-0.2px">Amanah API Log</span>
      <span class="file-badge" id="file-name-badge">connecting...</span>
      <span id="log-count" style="color:var(--muted);font-size:11px">0 events</span>
    </div>

    <div class="right-controls">
      <input type="text" id="search-box" class="search-input" placeholder="filter path, id, query..." />

      <div class="filter-pills">
        <button class="filter-pill active" data-method="ALL">ALL</button>
        <button class="filter-pill" data-method="GET">GET</button>
        <button class="filter-pill" data-method="POST">POST</button>
        <button class="filter-pill" data-method="PUT">PUT</button>
        <button class="filter-pill" data-method="DELETE">DEL</button>
      </div>

      <!-- Icon-only buttons -->
      <button class="icon-btn active" id="btn-autoscroll" title="Auto-scroll to latest">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
      </button>

      <button class="icon-btn" id="btn-clear" title="Clear view">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  </header>

  <main>
    <div class="log-list" id="log-container">
      <div class="empty-state" id="empty-state">Menunggu request API masuk...</div>
    </div>

    <aside class="detail-pane closed" id="detail-pane">
      <div class="detail-header">
        <div class="detail-tabs">
          <button class="detail-tab active" data-tab="response">Response</button>
          <button class="detail-tab" data-tab="request">Request</button>
          <button class="detail-tab" data-tab="headers">Headers</button>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="icon-btn" id="btn-copy-detail" title="Copy JSON">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
          <button class="icon-btn" id="btn-close-detail" title="Close detail">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="detail-content" id="detail-content">
        <pre><code id="detail-code">Select a request to inspect</code></pre>
      </div>
    </aside>
  </main>

  <script>
    const logs = [];
    let selectedId = null;
    let activeTab = 'response';
    let filterMethod = 'ALL';
    let filterSearch = '';
    let autoScroll = true;

    const container = document.getElementById('log-container');
    const detailPane = document.getElementById('detail-pane');
    const detailCode = document.getElementById('detail-code');
    const badgeFile = document.getElementById('file-name-badge');
    const logCountEl = document.getElementById('log-count');
    const emptyState = document.getElementById('empty-state');

    function highlightJson(obj) {
      if (!obj) return 'null';
      const str = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
      return str.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
        let cls = 'json-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-str';
        } else if (/true|false/.test(match)) {
          cls = 'json-bool';
        } else if (/null/.test(match)) {
          cls = 'json-num';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }

    function renderDetail() {
      if (!selectedId) return;
      const item = logs.find(l => l.id === selectedId);
      if (!item) return;

      let targetData = null;
      if (activeTab === 'response') {
        targetData = item.response?.body || item.error || { status: item.response?.statusCode || 500, note: 'No response body' };
      } else if (activeTab === 'request') {
        targetData = {
          method: item.request.method,
          url: item.request.url,
          query: item.request.query,
          body: item.request.body || null
        };
      } else if (activeTab === 'headers') {
        targetData = {
          requestHeaders: item.request.headers || {},
          responseHeaders: item.response?.headers || {}
        };
      }

      detailCode.innerHTML = highlightJson(targetData);
    }

    function addRow(item) {
      logs.push(item);
      logCountEl.textContent = logs.length + ' events';
      if (emptyState) emptyState.style.display = 'none';

      const method = (item.request.method || 'GET').toUpperCase();
      const status = item.response?.statusCode || item.error?.statusCode || 0;
      let statusClass = 'status-2xx';
      if (status >= 500) statusClass = 'status-5xx';
      else if (status >= 400) statusClass = 'status-4xx';
      else if (status >= 300) statusClass = 'status-3xx';

      const methodClass = 'method-' + method.toLowerCase();
      const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString('id-ID') : '--:--:--';
      const durationStr = item.durationMs !== undefined ? item.durationMs + 'ms' : '-';

      const row = document.createElement('div');
      row.className = 'log-row';
      row.dataset.id = item.id;
      row.dataset.method = method;
      row.dataset.path = item.request.path || item.request.url || '';

      row.innerHTML = 
        '<span class="method ' + methodClass + '">' + method + '</span>' +
        '<span class="status ' + statusClass + '">' + (status || '-') + '</span>' +
        '<span class="path" title="' + (item.request.url || item.request.path) + '">' + (item.request.path || item.request.url) + '</span>' +
        '<span class="duration">' + durationStr + '</span>' +
        '<span class="time">' + timeStr + '</span>';

      row.addEventListener('click', () => {
        document.querySelectorAll('.log-row.selected').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedId = item.id;
        detailPane.classList.remove('closed');
        renderDetail();
      });

      applyFilterToRow(row);
      container.appendChild(row);

      if (autoScroll) {
        container.scrollTop = container.scrollHeight;
      }
    }

    function applyFilterToRow(row) {
      const rowMethod = row.dataset.method;
      const rowPath = (row.dataset.path || '').toLowerCase();
      const query = filterSearch.toLowerCase();

      const methodMatch = filterMethod === 'ALL' || rowMethod === filterMethod;
      const searchMatch = !query || rowPath.includes(query) || (row.dataset.id || '').includes(query);

      row.style.display = (methodMatch && searchMatch) ? 'flex' : 'none';
    }

    function refilterAll() {
      document.querySelectorAll('.log-row').forEach(applyFilterToRow);
    }

    document.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterMethod = btn.dataset.method;
        refilterAll();
      });
    });

    document.getElementById('search-box').addEventListener('input', (e) => {
      filterSearch = e.target.value;
      refilterAll();
    });

    document.getElementById('btn-autoscroll').addEventListener('click', function() {
      autoScroll = !autoScroll;
      this.classList.toggle('active', autoScroll);
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      logs.length = 0;
      container.innerHTML = '<div class="empty-state">Tampilan dibersihkan. Menunggu request API baru...</div>';
      logCountEl.textContent = '0 events';
      detailPane.classList.add('closed');
      selectedId = null;
    });

    document.getElementById('btn-close-detail').addEventListener('click', () => {
      detailPane.classList.add('closed');
      selectedId = null;
      document.querySelectorAll('.log-row.selected').forEach(r => r.classList.remove('selected'));
    });

    document.querySelectorAll('.detail-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderDetail();
      });
    });

    document.getElementById('btn-copy-detail').addEventListener('click', () => {
      if (!selectedId) return;
      const item = logs.find(l => l.id === selectedId);
      if (!item) return;
      navigator.clipboard.writeText(JSON.stringify(item, null, 2));
      const btn = document.getElementById('btn-copy-detail');
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 1000);
    });

    // 1. Initial Load of History
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.activeFile) badgeFile.textContent = data.activeFile;
        if (Array.isArray(data.items)) {
          data.items.forEach(addRow);
        }
      })
      .catch(() => {});

    // 2. Realtime SSE Connection
    const eventSource = new EventSource('/api/live');
    eventSource.onmessage = (e) => {
      try {
        const item = JSON.parse(e.data);
        if (item.activeFile) {
          badgeFile.textContent = item.activeFile;
          return;
        }
        addRow(item);
      } catch (err) {}
    };
    eventSource.onerror = () => {
      badgeFile.textContent = 'reconnecting...';
    };
  </script>
</body>
</html>`;
}
