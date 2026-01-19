echo '=== Web Root ==='
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
echo '=== API Docs ==='
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/docs
echo '=== API Health Candidates ==='
echo '--- / ---'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/ || true
echo '--- /health ---'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/health || true
echo '--- /live ---'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/live || true
echo '--- /ready ---'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/ready || true
echo '--- /openapi.json ---'
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/openapi.json || true
