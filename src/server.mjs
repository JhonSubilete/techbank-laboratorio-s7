import { createApp } from './app.mjs';
const port = Number(process.env.PORT || 3000);
const server = createApp({
  environment: process.env.APP_ENV || 'local',
  version: process.env.APP_VERSION || '1.0.0',
});
server.listen(port, '0.0.0.0', () => console.log(`TechBank API escuchando en ${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
