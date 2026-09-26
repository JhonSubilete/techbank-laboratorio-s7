#!/usr/bin/env bash
set -euo pipefail
: "${APP_SHA:?Se requiere APP_SHA}"
mkdir -p evidence
exec > >(tee evidence/qa.txt) 2>&1
date -u '+Fecha UTC: %Y-%m-%dT%H:%M:%SZ'
echo "Commit: $APP_SHA"
docker run -d --name techbank-qa \
  --cpus=1 --memory=256m --read-only --tmpfs /tmp \
  -p 127.0.0.1:3000:3000 \
  -e APP_ENV=qa -e APP_VERSION="$APP_SHA" \
  "techbank-qa:$APP_SHA"
healthy=false
for attempt in $(seq 1 30); do
  state=$(docker inspect --format '{{.State.Health.Status}}' techbank-qa)
  if [ "$state" = healthy ]; then healthy=true; break; fi
  sleep 1
done
docker ps --filter name=techbank-qa
docker inspect --format '{{json .State.Health}}' techbank-qa | tee evidence/docker-health.json
test "$healthy" = true
curl --fail --silent --show-error -D evidence/http-headers.txt \
  http://127.0.0.1:3000/health -o evidence/health.json
cat evidence/http-headers.txt
cat evidence/health.json
echo
jq -e '.status == "ok" and .environment == "qa"' evidence/health.json
curl --fail --silent --show-error http://127.0.0.1:3000/ | tee evidence/root.json
echo
curl --fail --silent --show-error http://127.0.0.1:3000/api/status | tee evidence/status.json
echo
docker image inspect "techbank-qa:$APP_SHA" --format '{{.Id}}' | tee evidence/image-id.txt
docker logs techbank-qa
echo 'QA VALIDADO: Docker healthy y HTTP 200'
