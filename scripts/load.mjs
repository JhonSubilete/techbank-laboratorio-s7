import { performance } from 'node:perf_hooks';
const target = 'http://127.0.0.1:3000/health';
const results = [];
for (const concurrency of [5, 20, 50]) {
  const started = performance.now();
  const until = started + 10000;
  const latencies = [];
  let errors = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (performance.now() < until) {
      const t = performance.now();
      try {
        const r = await fetch(target, { signal: AbortSignal.timeout(3000) });
        const b = await r.json();
        if (r.status !== 200 || b.status !== 'ok') errors++;
      } catch { errors++; }
      latencies.push(performance.now() - t);
    }
  }));
  const seconds = (performance.now() - started) / 1000;
  latencies.sort((a,b) => a-b);
  const percentile = p => latencies[Math.ceil(latencies.length*p)-1] || 0;
  results.push({ concurrency, duration_s: +seconds.toFixed(2), requests: latencies.length,
    errors, rps: +(latencies.length / seconds).toFixed(2),
    p50_ms: +percentile(.50).toFixed(2), p95_ms: +percentile(.95).toFixed(2),
    p99_ms: +percentile(.99).toFixed(2) });
}
console.log(JSON.stringify({ scope: 'API sin base de datos. Generador y contenedor en el mismo runner. Prueba cerrada de 10 s por nivel, no capacidad de producción.', target, results }, null, 2));
if (results.some(r => r.errors > 0)) process.exitCode = 1;
