# Toko Kita

Toko online kecil yang dijalankan lokal di laptop. Katalog, keranjang, checkout manual (transfer/COD), dan panel admin — semuanya pakai Next.js + SQLite, tanpa layanan pihak ketiga.

## Jalankan di laptop

Butuh Node.js 20.9+ (dikembangkan dengan Node 22).

```bash
npm install
cp .env.example .env      # kalau sudah ada, lewati
npm run db:push           # buat tabel SQLite kalau belum ada
npm run db:seed           # isi produk dummy (MENGHAPUS data lama!)
npm run dev
```

Buka http://localhost:3000.

Panel admin: http://localhost:3000/admin

- Email: `admin@tokokita.test`
- Kata sandi: `tokokita123`

Ganti keduanya sebelum toko dipakai sungguhan.

## Yang sudah ada

- Beranda editorial, katalog dengan filter kategori + pencarian + urutan, halaman produk, keranjang, checkout, halaman konfirmasi pesanan.
- Halaman Tentang, Kontak, FAQ, dan Kebijakan dengan salinan yang ditulis manual.
- Panel admin: ringkasan, kelola produk (termasuk unggah foto & varian), kelola pesanan + ubah status, kelola kategori.
- Sesi admin pakai cookie bertanda tangan HMAC; keranjang juga disimpan di cookie. Tidak ada database user yang kompleks.
- Pembayaran masih manual: transfer bank atau COD. Tidak ada gateway.
- Status pesanan lengkap: menunggu bayar → dibayar → dikemas → dikirim → selesai, plus dibatalkan (stok otomatis dikembalikan). Pesanan pending otomatis dibatalkan setelah 3 hari.
- Notifikasi WhatsApp untuk setiap perubahan status lewat tabel `NotificationOutbox` + bot Baileys. Pesan tidak hilang walau bot sedang mati.
- Kartu katalog 3D memakai Three.js + React Three Fiber: gambar produk jadi tekstur kartu berketebalan yang bisa diputar dengan kursor/panah keyboard. Scene di-*lazy load*; kartu hanya memasang kanvas saat di-hover. Tanpa WebGL atau dengan `prefers-reduced-motion`, gambar statis yang tampil.

## Skrip

| Perintah            | Fungsi                                             |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Jalankan server pengembangan                        |
| `npm run build`     | Build produksi                                      |
| `npm run start`     | Jalankan hasil build                                |
| `npm run lint`      | Cek eslint                                          |
| `npm run db:push`   | Sinkronkan schema Prisma ke SQLite                   |
| `npm run db:seed`   | Isi ulang data dummy (destruktif!)                  |
| `npm run db:studio` | Buka Prisma Studio untuk melihat database           |
| `npm run bot`       | Jalankan bot WhatsApp + worker notifikasi            |

## Catatan penting

- `npm run db:seed` **menghapus semua data** lalu mengisi ulang. Jangan dijalankan saat ada pesanan nyata.
- Foto produk saat ini foto stok dari [Openverse](https://openverse.org/) (lisensi CC0/public domain), bukan foto barang yang sebenarnya. Dipakai supaya bentuk produk bisa dibayangkan saat tekstur 3D diputar. Upload foto asli lewat panel admin; hasilnya masuk ke `public/uploads/products/`. Sumber tiap foto dicatat di bawah.
- Database SQLite ada di `prisma/dev.db` dan sengaja tidak ikut version control. Isi ulang dengan `db:push` + `db:seed`.
- `.env` berisi `AUTH_SECRET` placeholder. Isi dengan string acak panjang sebelum online.
- Saat domain sudah tersedia, set `NEXT_PUBLIC_SITE_URL` di `.env` supaya metadata/Open Graph memakai URL yang benar.
- Ongkir: Rp22.000, gratis untuk subtotal di atas Rp500.000. Nomor pesanan berformat `TK-YYMMDD-XXXX`.

## Bot WhatsApp & notifikasi

Jalankan dua terminal:

```bash
npm run dev   # web
npm run bot   # WA + worker outbox
```

Sebelum pakai akun WA asli, set `BOT_DRY_RUN="true"` dulu — bot tidak menyambung WhatsApp, tapi tetap memproses outbox (pesan ditandai terkirim di database untuk uji alur).

Untuk pakai WA sungguhan:
1. Set `BOT_DRY_RUN="false"`.
2. Pilih login QR (`BOT_LOGIN_METHOD="qr"`) atau pairing (`BOT_LOGIN_METHOD="pairing"` + `BOT_PAIR_NUMBER="62..."`).
3. Isi `BOT_ALLOWED_NUMBERS` dengan nomor yang boleh dibalas bot (format `62...`, pisah koma). Ini hanya untuk **chat masuk**; notifikasi keluar tetap dikirim ke nomor pembeli dari database.
4. Jalankan `npm run bot`, scan QR / masukkan kode pairing sekali saja. Sesi tersimpan di `bot/session/` yang sudah di-gitignore.

Bot melakukan:
- membalas FAQ singkat & cek status pesanan (nomor `TK-YYMMDD-XXXX`, hanya untuk nomor pemesan yang cocok),
- mengirim pesan dari `NotificationOutbox` ke WA pembeli, retry maksimal 3x,
- membatalkan otomatis pesanan `pending` yang lewat 3 hari dan mengembalikan stoknya.

> Baileys **bukan** API resmi WhatsApp. Risiko banned akun tetap ada. Jangan pakai untuk spam, dan jangan commit folder `bot/session/`.

## Struktur ringkas

```
prisma/schema.prisma       model data (Admin, Product, Order, dll.)
prisma/seed.ts             data dummy (memakai foto di public/uploads/seed/)
src/app/(toko)/            halaman toko (route group)
src/app/admin/             panel admin + login
src/components/            komponen UI
src/lib/actions/           server actions
src/lib/{auth,cart,db,store,format}.ts
```

## Kredit foto dummy

Foto di `public/uploads/seed/` diambil lewat API Openverse dan semuanya berlisensi **CC0 / Public Domain Mark**, jadi tidak memerlukan atribusi. Sumbernya dicatat di sini supaya mudah ditukai:

| File | Sumber |
| --- | --- |
| `gelas-tembakau.jpg` | https://pd.w.org/2026/03/54769c7e74fb7c7e2.04937297-1536x2048.jpeg |
| `nampan-kayu-jati.jpg` | https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3B4MTI1NTk0NC1pbWFnZS1rd3Z5Mmllcy5qcGc.jpg |
| `tas-kanvas-lipat.jpg` | https://live.staticflickr.com/65535/53595381936_e8880666bc_b.jpg |
| `sarung-bantal-linen.jpg` | https://live.staticflickr.com/65535/53902936080_78f7fb3d2f_b.jpg |
| `lampu-meja-kaleng.jpg` | https://live.staticflickr.com/1747/42381074432_33733f4667_b.jpg |
| `buku-catatan-jahit.jpg` | https://live.staticflickr.com/1891/44122997821_21b3dd5159_b.jpg |
| `kotak-rempah-rotan.jpg` | https://live.staticflickr.com/65535/51372253640_9655263456_b.jpg |
| `dompet-kulit-sisa.jpg` | https://pd.w.org/2026/06/2036a1d3e54bbbc40.82155933-2048x1536.jpg |
