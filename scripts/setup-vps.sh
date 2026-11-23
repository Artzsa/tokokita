#!/usr/bin/env bash
# Setup aplikasi di VPS Linux (Ubuntu/Debian). Jalankan dari folder repo.
# Prasyarat: Node.js 20.9+ sudah terpasang (lihat DEPLOY.md).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Memasang dependensi"
npm ci

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "File .env baru dibuat dari .env.example."
  echo "EDIT .env dulu (wajib: AUTH_SECRET acak, BOT_DRY_RUN=false),"
  echo "lalu jalankan ulang skrip ini."
  exit 1
fi

echo "==> Sinkronkan database"
npx prisma db push

echo "==> Backfill status pembayaran pesanan lama (aman, idempoten)"
npm run db:backfill-payments || true

echo "==> Build production"
npm run build

echo "==> Menjalankan PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "Selesai. Web di port 3000, bot jalan sebagai toko-bot."
echo "Pasang reverse proxy + HTTPS (Caddy/Nginx) sesuai DEPLOY.md."
echo "Cek: pm2 status | pm2 logs toko-web"
