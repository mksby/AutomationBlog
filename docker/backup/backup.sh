#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"

mkdir -p "$BACKUP_DIR"

docker exec automation-blog-prod-postgres-1 \
  pg_dump -U "${DATABASE_USERNAME:-strapi}" "${DATABASE_NAME:-strapi}" \
  | gzip > "${BACKUP_DIR}/strapi_${TIMESTAMP}.sql.gz"

echo "Backup created: ${BACKUP_DIR}/strapi_${TIMESTAMP}.sql.gz"
