
#!/usr/bin/env bash
# Robust launcher for Docker Compose backend with vendor in Docker volume only.

set -euo pipefail

### Configuration
SERVICE_NAME="backend"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# If your script is in scripts/ and project root is one level up, uncomment:
# PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=("-f" "${PROJECT_ROOT}/docker-compose.yml")

### Utilities
log()  { printf '\033[1;34m[INFO]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[WARN]\033[0m %s\n' "$*"; }
err()  { printf '\033[1;31m[ERR ]\033[0m %s\n' "$*" >&2; }
die()  { err "$*"; exit 1; }

trap 'err "Interrupted"; exit 1' INT

### Preflight checks
command -v docker >/dev/null 2>&1 || die "Docker n'est pas installé ou pas dans le PATH."
# Compose V2 is integrated as `docker compose`
docker compose version >/dev/null 2>&1 || die "Docker Compose V2 indisponible. Installe-le (docker compose)."

log "Validation de la configuration Compose..."
docker compose "${COMPOSE_FILES[@]}" config >/dev/null || die "docker-compose.yml invalide (volumes/services?)."

### Functions

# Wait until service is running or healthy (if healthcheck defined)
wait_service_ready() {
  local retries="${1:-30}"
  local delay="${2:-2}"

  log "Attente du service ${SERVICE_NAME} (up/healthy)..."
  for i in $(seq 1 "$retries"); do
    local cid
    cid="$(docker compose "${COMPOSE_FILES[@]}" ps -q "${SERVICE_NAME}" || true)"
    if [ -n "${cid}" ]; then
      # If healthcheck exists, prefer Health.Status; else check Running
      local status
      status="$(docker inspect "${cid}" --format '{{ if .State.Health }}{{ .State.Health.Status }}{{ else }}{{ .State.Status }}{{ end }}' 2>/dev/null || echo "unknown")"
      case "${status}" in
        healthy|running)
          log "Service ${SERVICE_NAME} prêt (status=${status})."
          return 0
          ;;
      esac
    fi
    sleep "${delay}"
  done
  warn "Service ${SERVICE_NAME} non prêt après ${retries} tentatives."
  return 1
}

# Detect composer inside the container
composer_cmd() {
  # Try common paths in the container
  local cmd
  for cmd in composer /usr/local/bin/composer /usr/bin/composer "php /usr/local/bin/composer.phar" "php /usr/bin/composer.phar"; do
    if docker compose "${COMPOSE_FILES[@]}" exec -T "${SERVICE_NAME}" sh -lc "command -v ${cmd%% *} >/dev/null 2>&1 || [ -f \"${cmd##* }\" ]"; then
      echo "${cmd}"
      return 0
    fi
  done
  # Fallback to 'composer' (will error if missing)
  echo "composer"
}

# Check vendor presence inside container (not on host!)
has_vendor() {
  docker compose "${COMPOSE_FILES[@]}" exec -T "${SERVICE_NAME}" sh -lc '[ -d /var/www/vendor ] && [ -f /var/www/vendor/autoload.php ]'
}

### Main sequence

log "Démarrage du service ${SERVICE_NAME}..."
docker compose "${COMPOSE_FILES[@]}" up -d "${SERVICE_NAME}"

# Wait for service to be ready (best effort)
wait_service_ready 30 2 || warn "On continue malgré l'état non-healthy."

# Ensure vendor is present inside container
if has_vendor; then
  log "Vendor déjà présent dans le conteneur (autoload.php OK)."
else
  warn "Vendor absent ou incomplet dans le conteneur. Installation en cours..."

  # Prefer 'run' to avoid 'service not started' race and to run in a fresh container
  # It will use the service's image and mount the same volumes.
  # If you need specific user (e.g., www-data), uncomment: --user 33:33
  # Also ensure network and env of the service are inherited by 'run'.
  COMP_CMD="$(composer_cmd)"
  log "Commande Composer détectée: ${COMP_CMD}"

  docker compose "${COMPOSE_FILES[@]}" run --rm \
    "${SERVICE_NAME}" \
    sh -lc "${COMP_CMD} install --no-interaction --prefer-dist"

  # Fix permissions (adjust user/group to match your PHP-FPM setup)
  log "Ajustement des permissions sur /var/www/vendor..."
  docker compose "${COMPOSE_FILES[@]}" exec -T "${SERVICE_NAME}" sh -lc '
    if id www-data >/dev/null 2>&1; then
      chown -R www-data:www-data /var/www/vendor || true
    else
      chown -R 1000:1000 /var/www/vendor || true
    fi
  '

  if has_vendor; then
    log "Installation des dépendances PHP terminée (vendor présent)."
  else
    die "Échec: vendor toujours absent après installation."
  fi
fi

# Optional: show quick status
log "Montages et contenu:"
docker compose "${COMPOSE_FILES[@]}" exec -T "${SERVICE_NAME}" sh -lc '
  mount | grep -E "/var/www($|/vendor)" || true
  echo "---"
  ls -la /var/www | head
  echo "---"
  ls -la /var/www/vendor | head
'

log "Backend prêt. 🚀"
