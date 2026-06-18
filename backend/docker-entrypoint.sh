#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect()
    .then(() => client.end())
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 1
done

echo "Running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js

echo "Starting API..."
exec "$@"
