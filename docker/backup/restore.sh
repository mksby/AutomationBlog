#!/bin/bash
set -euo pipefail

BACKUP_FILE="${1:?Usage: restore.sh <backup_file.sql.gz>}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: File not found: $BACKUP_FILE"
  exit 1
fi

gunzip -c "$BACKUP_FILE" | docker exec -i automation-blog-prod-postgres-1 \
  psql -U "${DATABASE_USERNAME:-strapi}" "${DATABASE_NAME:-strapi}"

echo "Restore completed from: $BACKUP_FILE"
