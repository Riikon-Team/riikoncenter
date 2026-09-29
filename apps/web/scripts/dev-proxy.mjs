import http from 'http';
import httpProxy from 'http-proxy';

const GAME_GATEWAY_PORT = 3310;
const PROXY_PORT = 3309;

// Create a proxy server with custom application logic
const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${GAME_GATEWAY_PORT}`,
  ws: true,
  changeOrigin: true
});

// Intercept the response from the Game Gateway
proxy.on('proxyRes', function (proxyRes, req, res) {
  // Strip out the Content-Security-Policy header completely so Iframe works!
  delete proxyRes.headers['content-security-policy'];
  delete proxyRes.headers['x-frame-options'];
});

proxy.on('error', function (err, req, res) {
  console.warn('[Dev Proxy Error]', err.message);
  if (res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Game Gateway is not running or starting up...');
  }
});

// Setup the HTTP Server
const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// Setup WebSocket Proxying
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start listening
server.listen(PROXY_PORT, () => {
  console.log('====================================================');
  console.log(`[Dev Proxy] CSP Stripper listening on http://localhost:${PROXY_PORT}`);
  console.log(`  -> Forwarding to Game Gateway: http://localhost:${GAME_GATEWAY_PORT}`);
  console.log('====================================================');
});
