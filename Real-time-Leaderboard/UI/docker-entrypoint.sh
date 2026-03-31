#!/bin/sh
set -e

# Create runtime env file for SPA
: "Writing runtime env.js from environment variables"
cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-http://localhost:5000}"
};
EOF

# Execute CMD (nginx)
exec "$@"
