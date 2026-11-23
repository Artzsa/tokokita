# Deploy ke VPS (Oracle Cloud Always Free)

App ini butuh Node.js yang jalan terus + disk persisten (SQLite & upload).
VPS cocok; Vercel / shared hosting tidak.

## 1. Buat VM di Oracle Cloud

1. Daftar/login https://cloud.oracle.com (butuh kartu kredit untuk verifikasi,
   tapi tier Always Free tidak ditagih).
2. **Compute → Instances → Create Instance**.
   - Image: **Ubuntu 22.04/24.04** (atau Oracle Linux).
   - Shape: **VM.Standard.A1.Flex** (ARM, Always Free) — pilih 1–2 OCPU, 6–12 GB RAM.
     Kalau ARM tidak tersedia, pakai `VM.Standard.E2.1.Micro` (AMD, 1 GB, Always Free).
   - Networking: buat/assign **public IP**.
   - SSH key: upload public key kamu (`~/.ssh/id_ed25519.pub`), atau generate baru.
3. Setelah instance jalan, catat **public IP**.

## 2. Buka port (Security List / NSG)

Di **Networking → VCN → Security List** (subnet instance), tambah **Ingress Rules**:
- TCP **80** (HTTP) dari `0.0.0.0/0`
- TCP **443** (HTTPS) dari `0.0.0.0/0`
- TCP **22** (SSH) — sebaiknya batasi ke IP kamu.

> Port 3000 TIDAK perlu dibuka ke publik; Caddy/Nginx yang meneruskan ke 3000.

## 3. SSH & pasang Node.js

```bash
ssh ubuntu@<IP_VPS>

# Node.js 22 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v   # pastikan >= 20.9
```

## 4. Ambil kode & setup

```bash
git clone https://github.com/Artzsa/tokokita.git
cd tokokita
bash scripts/setup-vps.sh
```

Skrip akan memasang dependensi, membuat `.env` (kalau belum ada), sinkron DB,
backfill, build, lalu menjalankan PM2. **Saat pertama kali skrip berhenti untuk
menyuruh edit `.env`.** Edit:

```bash
nano .env
```
Wajib diubah:
- `AUTH_SECRET` → string acak panjang. Generate: `openssl rand -base64 48`
- `BOT_DRY_RUN="false"` (supaya bot benar-benar menyambung WA)
- `BOT_LOGIN_METHOD` → `qr` atau `pairing` (pairing lebih mudah di server headless)
- `BOT_PAIR_NUMBER` → nomor WA bot (format 62xxx) kalau pakai pairing.

Lalu jalankan ulang:
```bash
bash scripts/setup-vps.sh
pm2 status
```

> JANGAN jalankan `npm run db:seed` di server (menghapus data).

## 5. HTTPS + domain (Caddy)

Arahkan **A record** domain kamu ke IP VPS. Lalu:

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```

Salin `Caddyfile` dari repo, ganti `toko.example.com` dengan domain kamu:
```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile   # ganti domain
sudo systemctl reload caddy
```
Caddy otomatis mengurus sertifikat Let's Encrypt. Buka `https://domainkamu`.

**Belum punya domain?** Opsi sementara:
- Pakai layanan DNS gratis (mis. DuckDNS) yang menunjuk ke IP VPS, lalu pakai
  hostname itu di Caddyfile.
- Atau uji via `http://<IP_VPS>` (tanpa HTTPS) — tapi cookie admin memakai flag
  `secure` di production, jadi login admin tidak akan berfungsi tanpa HTTPS.
  Untuk uji cepat, set `NODE_ENV=development` sementara (tidak disarankan publik).

## 6. Login bot WhatsApp

Bot perlu login sekali. Kalau `BOT_LOGIN_METHOD=pairing`:
- Buka panel admin → Pengaturan → koneksi WhatsApp, masukkan nomor, minta kode
  pairing, lalu masukkan kode itu di aplikasi WA (Perangkat tertaut → Tautkan
  dengan nomor telepon).
Kalau `qr`: scan QR yang tampil di panel admin.

Sesi tersimpan di `bot/session/` (persisten). Setelah login, bot otomatis
tersambung lagi saat reboot.

## 7. Operasional

```bash
pm2 status              # lihat web & bot
pm2 logs toko-web       # log web
pm2 logs toko-bot       # log bot
pm2 restart toko-bot    # restart bot
pm2 restart toko-web    # restart web
pm2 save                # simpan daftar proses
```

Supaya hidup lagi setelah reboot:
```bash
pm2 startup   # ikuti perintah yang dicetak (biasanya pakai sudo)
pm2 save
```

## 8. Update kode

```bash
cd tokokita
git pull
npm ci
npx prisma db push
npm run build
pm2 restart toko-web toko-bot
```

## Checklist sebelum dibuka ke customer

- [ ] Kata sandi admin diganti (bukan `tokokita123`).
- [ ] Rekening bank asli diisi di Pengaturan.
- [ ] Data dummy (produk/order uji) dibersihkan atau diganti data asli.
- [ ] `AUTH_SECRET` acak & `BOT_DRY_RUN=false`.
- [ ] HTTPS aktif (domain + Caddy).
- [ ] Bot sudah login dan `bot_status=connected`.
- [ ] Port 3000 tidak terbuka ke publik; hanya 80/443.
