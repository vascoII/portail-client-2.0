
#!/usr/bin/env bash
set -euo pipefail

echo "=== Arrêt des serveurs backend (port 8000) et frontend (port 3000) ==="

# Fonction pour tuer les processus sur un port donné
kill_port() {
  local PORT=$1
  PID=$(lsof -ti tcp:$PORT || true)
  if [ -n "$PID" ]; then
    echo "→ Arrêt du processus sur le port $PORT (PID: $PID)..."
    kill "$PID"
    echo "✓ Port $PORT libéré."
  else
    echo "ℹ Aucun processus trouvé sur le port $PORT."
  fi
}

kill_port 8000
kill_port 3000

echo "✅ Tous les serveurs ont été arrêtés."
