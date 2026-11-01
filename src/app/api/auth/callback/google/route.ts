import { NextRequest, NextResponse } from 'next/server';
import { proxyToUpstream } from '@/server/proxy/upstream-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state') || '';
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Deteksi penautan akun Google via popup dari halaman settings (prefix 'link_')
  if (state.startsWith('link_')) {
    const errorParam = error ? JSON.stringify(error) : 'null';
    const codeParam = code ? JSON.stringify(code) : 'null';
    const stateParam = JSON.stringify(state);

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Otorisasi Google - Amanah Healthcare</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #0284c7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p style="font-size: 14px; font-weight: 500;">Menyelesaikan penautan akun Google...</p>
  <p style="font-size: 12px; color: #64748b;">Jendela ini akan tertutup secara otomatis.</p>
  <script>
    (function() {
      var err = ${errorParam};
      var code = ${codeParam};
      var state = ${stateParam};
      var targetOrigin = window.location.origin;

      if (window.opener && !window.opener.closed) {
        if (err) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: err
          }, targetOrigin);
        } else if (code) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_CODE',
            code: code,
            state: state,
            redirectUri: window.location.origin + window.location.pathname
          }, targetOrigin);
        }
        window.close();
      } else {
        window.location.href = '/admin/settings';
      }
    })();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }

  // Fallback untuk login SSO reguler yang ditangani oleh Better Auth
  return proxyToUpstream(request, {
    prefix: '/api/auth',
    pathSegments: ['callback', 'google']
  });
}
