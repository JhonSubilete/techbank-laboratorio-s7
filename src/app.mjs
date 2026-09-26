import { createServer } from 'node:http';

export function createApp({ environment = 'local', version = '1.0.0' } = {}) {
  return createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, body) => {
      res.writeHead(status);
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return send(405, { error: 'Metodo no permitido' });
    }
    if (path === '/') return send(200, { app: 'TechBank API', version });
    if (path === '/health') return send(200, { status: 'ok', environment, version });
    if (path === '/api/status') return send(200, { service: 'techbank', state: 'available' });
    return send(404, { error: 'Ruta no encontrada' });
  });
}
