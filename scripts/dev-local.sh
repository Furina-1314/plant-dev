#!/usr/bin/env bash
set -euo pipefail
if ! command -v npm >/dev/null 2>&1; then
  echo "npm 未安装。请先安装 Node.js"
  exit 1
fi
npm install
npm run dev
