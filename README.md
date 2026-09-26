# TechBank · Laboratorio S7

Solución del laboratorio de IT for Banking: Git, integración continua, Docker en QA, versionado del pipeline y análisis de escalabilidad.

## Ejecución

Se usan Node.js 24 y módulos nativos, sin dependencias externas de producción.

```bash
npm ci
npm test
npm start
curl http://localhost:3000/health
```

La API expone `/`, `/health` y `/api/status`. No contiene datos de clientes ni operaciones bancarias.

## Eventos Git y pipeline

- `feature/test`: desarrollo de mejoras de pruebas.
- PR hacia `develop` o `main`: pruebas y construcción Docker.
- Push/merge en `develop`: pruebas, Docker y despliegue en `qa`.
- Ejecución manual en `develop`: repite las tres etapas.

Los jobs son independientes. El job Docker guarda la imagen y su ID en un artifact. QA descarga ese artifact y comprueba el mismo ID antes de ejecutar el contenedor. El workflow solo necesita `contents: read`.

## QA temporal

GitHub Actions crea un contenedor con límite de 1 CPU y 256 MiB, publica el puerto exclusivamente en localhost y comprueba el HEALTHCHECK de Docker y `/health` con curl. El job guarda las respuestas HTTP, la identidad de la imagen y los resultados de carga. El contenedor se elimina al finalizar.

Este es un entorno QA real y temporal. No es un servidor persistente ni una aplicación pública. Para QA permanente se requiere una VM o clúster con despliegue de la misma imagen.

## Evidencias

En la pestaña Actions: jobs de pruebas, construcción Docker y QA. Los artifacts conservan pruebas y respuestas por 14 días, y la imagen por 1 día. Se entregará una copia de los logs y capturas para conservar el resultado del laboratorio.

La prueba de carga ejecuta 5, 20 y 50 clientes concurrentes durante 10 segundos cada uno. Sus resultados solo describen esta API pequeña en este runner. No estiman la capacidad de una aplicación bancaria completa.

## Versiones del pipeline

- `v1.0.0`: pipeline inicial con 4 pruebas.
- `v1.1.0`: pruebas 404/405, cobertura y validación de versión desplegada.

Las etiquetas del pipeline abarcan el snapshot del repositorio. La versión de la API es independiente. Los cambios del workflow pasan por PR. La revisión por una segunda persona debe realizarla un compañero real y no se atribuye a una persona inexistente.

## Escalabilidad

Métricas: CPU, memoria, p95/p99, solicitudes por segundo y errores. Para crecer, se propone balanceador y réplicas sin estado. El HPA puede partir de un objetivo de CPU de 60% con requests/limits definidos y un mínimo de 2 réplicas. Ese 60% es un criterio de diseño, no un dato medido. La memoria, la latencia y el backend deben contrastarse en una prueba más larga y con generador separado.
