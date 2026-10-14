// Temporary "Coming soon" gate for the public domain (October 2026).
//
// While the copy is still being edited, anyone visiting aporia-films.com or
// www.aporia-films.com sees a plain, unbranded "Coming soon" page on every path.
// The real site keeps working at https://aporia-films.vercel.app for previewing.
//
// To put the real site on the domain: delete this file and push to main.
// No DNS or Vercel dashboard changes are needed.

const GATED_HOSTS = new Set(['aporia-films.com', 'www.aporia-films.com']);

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Coming soon</title>
<link rel="icon" href="data:,">
<style>
  html, body { height: 100%; margin: 0; }
  body {
    display: flex; align-items: center; justify-content: center;
    background: #1f1f1e; color: #efeee8;
    font: 300 clamp(20px, 3vw, 28px)/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
    letter-spacing: .02em;
  }
</style>
</head>
<body>
<p>Coming soon.</p>
</body>
</html>`;

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  if (!GATED_HOSTS.has(host)) return; // any other address (e.g. aporia-films.vercel.app): serve the real site

  const headers = {
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex',
  };
  // No site icon or other files on the domain while gated, so no branding leaks into the browser tab.
  const path = new URL(request.url).pathname;
  if (path !== '/' && /\.[a-z0-9]+$/i.test(path)) return new Response('Not found', { status: 404, headers });

  return new Response(PAGE, { status: 200, headers: { ...headers, 'content-type': 'text/html; charset=utf-8' } });
}
