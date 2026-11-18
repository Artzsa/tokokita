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

## Catatan penting

- `npm run db:seed` **menghapus semua data** lalu mengisi ulang. Jangan dijalankan saat ada pesanan nyata.
- Foto produk saat ini ilustrasi SVG abstrak, bukan foto asli. Upload foto asli lewat panel admin; hasilnya masuk ke `public/uploads/products/`.
- Database SQLite ada di `prisma/dev.db` dan sengaja tidak ikut version control. Isi ulang dengan `db:push` + `db:seed`.
- `.env` berisi `AUTH_SECRET` placeholder. Isi dengan string acak panjang sebelum online.
- Saat domain sudah tersedia, set `NEXT_PUBLIC_SITE_URL` di `.env` supaya metadata/Open Graph memakai URL yang benar.
- Ongkir: Rp22.000, gratis untuk subtotal di atas Rp500.000. Nomor pesanan berformat `TK-YYMMDD-XXXX`.

## Struktur ringkas

```
prisma/schema.prisma       model data (Admin, Product, Order, dll.)
prisma/seed.ts             data dummy + generator SVG
src/app/(toko)/            halaman toko (route group)
src/app/admin/             panel admin + login
src/components/            komponen UI
src/lib/actions/           server actions
src/lib/{auth,cart,db,store,format}.ts
```
