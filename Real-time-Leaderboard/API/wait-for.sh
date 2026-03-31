#!/bin/bash
set -e

host_sql=${SQL_SERVER_HOST:-sqlserver}
port_sql=${SQL_SERVER_PORT:-1433}
host_redis=${REDIS_HOST:-redis}
port_redis=${REDIS_PORT:-6379}
max_wait=${WAIT_TIMEOUT:-60}

echo "Waiting for SQL Server (${host_sql}:${port_sql}) and Redis (${host_redis}:${port_redis})..."

i=0
until bash -c "</dev/tcp/${host_sql}/${port_sql}" >/dev/null 2>&1; do
  i=$((i+1))
  echo "Waiting for ${host_sql}:${port_sql} ($i/$max_wait)..."
  sleep 1
  if [ $i -ge $max_wait ]; then
    echo "Timeout waiting for ${host_sql}:${port_sql}"
    exit 1
  fi
done

i=0
until bash -c "</dev/tcp/${host_redis}/${port_redis}" >/dev/null 2>&1; do
  i=$((i+1))
  echo "Waiting for ${host_redis}:${port_redis} ($i/$max_wait)..."
  sleep 1
  if [ $i -ge $max_wait ]; then
    echo "Timeout waiting for ${host_redis}:${port_redis}"
    exit 1
  fi
done

echo "Dependencies are up. Starting app..."
exec "$@"
