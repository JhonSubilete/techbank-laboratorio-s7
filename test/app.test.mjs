import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.mjs';

let server;
let base;
before(async () => {
  server = createApp({ environment: 'qa', version: '1.0.0' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('GET / identifica la aplicacion y version', async () => {
  const r = await fetch(base);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { app: 'TechBank API', version: '1.0.0' });
});
test('GET /health informa estado y entorno QA', async () => {
  const r = await fetch(`${base}/health`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { status: 'ok', environment: 'qa', version: '1.0.0' });
});
test('GET /api/status retorna el servicio disponible', async () => {
  const r = await fetch(`${base}/api/status`);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).state, 'available');
});
test('Health mantiene JSON y admite query string', async () => {
  const r = await fetch(`${base}/health?probe=1`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /application\/json/);
  assert.equal(r.headers.get('cache-control'), 'no-store');
});

test('Ruta inexistente devuelve 404', async () => {
  const r = await fetch(`${base}/missing`);
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: 'Ruta no encontrada' });
});
test('POST devuelve 405 y anuncia GET', async () => {
  const r = await fetch(`${base}/health`, { method: 'POST' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET');
});
