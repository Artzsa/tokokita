# Arah Desain Toko Kita

Dokumen ini adalah sumber arah visual dan aturan konten. Filter anti-slop dipakai di atas dokumen ini, bukan sebagai pengganti arah.

## 1. Produk dan audiens

- **Apa ini:** toko online kecil untuk perkakas rumah, tas, dan benda harian lain, dijalankan sendiri dari Yogyakarta.
- **Siapa pembelinya:** orang yang mencari barang awet dan mau membaca bahan, ukuran, serta asal barang sebelum membeli.
- **Tugas utama pembeli:** menemukan produk, memahami ukurannya, lalu checkout tanpa akun.
- **Tugas utama admin:** melihat pesanan yang perlu ditindaklanjuti, mengubah status, dan memastikan bot WhatsApp hidup.
- **Kendala:** pembayaran manual (transfer atau COD), konfirmasi lewat WhatsApp, katalog kecil, pengelolaan satu orang.

## 2. Karakter merek

Hangat, jujur, tenang, dan editorial. Bukan "startup teknologi". Bahasa Indonesia sehari-hari, tanpa istilah pemasaran.

Konsekuensi:
- Warna tanah (cream, ink, clay, moss), bukan gradient atau neon.
- Tipografi serif untuk judul, sans untuk teks. Huruf kecil dan spasi lega, bukan poster.
- Garis rambut dan bidang datar. Bayangan hanya saat benar-benar ada lapisan.
- Tidak ada angka atau janji yang tidak bisa dibuktikan dari data toko.

## 3. Dials

| Permukaan | ENERGY | RHYTHM | MOTION | Alasan |
| --- | --- | --- | --- | --- |
| Toko | 2 | 2 | 1 | Katalog butuh hangat dan bernyawa, tetapi barang harus lebih dulu terlihat daripada animasi. |
| Panel admin | 1 | 1 | 1 | Alat kerja. Kecepatan, kepastian, dan keterbacaan lebih penting daripada kejutan visual. |

MOTION 1 berarti hover, transisi pendek, dan reveal sekali saat masuk viewport. Tidak ada loop tanpa henti, tidak ada elemen yang bergerak terus-menerus.

## 4. Token

Sumber kebenaran: `src/app/globals.css` (`@theme`).

- `paper` `#f4efe6`, `paper-deep` `#ebe3d6`, `line` `#d8cdbb` untuk permukaan dan garis.
- `ink` `#171310`, `ink-soft` `#453c33`, `muted` `#6f6457` untuk teks.
- `clay` `#a9491f` sebagai aksen utama, dipakai sedikit: tautan aktif, status, satu CTA.
- `moss` `#2e4739` untuk bidang penekanan dan status positif.
- Radius hanya `none`, `hair` (2px), dan `tag` (pill) untuk label kecil.
- Font: Fraunces (judul) dan Instrument Sans (teks). Keduanya dipilih untuk karakter bengkel, bukan karena default alat.

## 5. Aturan konten

1. **Angka harus punya sumber.** Hitungan produk, pesanan, dan penjualan diambil dari database. Jangan menulis jumlah mitra, tahun pengalaman, atau waktu proses kalau belum ada datanya.
2. **Janji harus benar-benar dijalankan.** Contoh yang boleh: checkout tanpa akun, konfirmasi manual lewat WhatsApp, stok dihitung dari sisa nyata, nomor pesanan bisa dibuka lagi.
3. **Label harus cocok dengan query.** Section "paling sering dipesan" hanya tampil kalau datanya berasal dari penjualan, bukan dari urutan `createdAt`.
4. **Tidak ada fitur palsu.** Kalau belum ada newsletter, jangan bikin section newsletter. Tautan WhatsApp disebut sebagai WhatsApp.
5. **Placeholder harus ditandai.** Data berikut belum diberikan pemilik toko dan karena itu tidak ditampilkan sebagai fakta:
   - rekening bank
   - alamat, email, Instagram, dan jam buka
   - tahun berdiri
   - asal atau kota operasional
   - ongkos kirim dan ambang gratis kirim (nilai saat ini masih asumsi dan harus dikonfirmasi)

   Tambahkan kembali ke `src/lib/store.ts` atau tabel `Setting` setelah datanya benar-benar ada.

## 6. Aturan antarmuka

- Satu fokus per layar. Di toko, fokusnya produk. Di admin, fokusnya pesanan yang butuh tindakan.
- Label uppercase dengan tracking lebar hanya untuk penanda bagian, bukan untuk setiap teks kecil.
- Panah (`→`, `↗`) hanya dipakai kalau arahnya berarti: keluar situs, atau langkah berikutnya. Bukan hiasan di setiap tombol.
- Ikon memakai satu keluarga (Lucide) dan hanya kalau maknanya jelas. Ikon dekoratif dihapus.
- Status tidak boleh dibedakan hanya dengan warna. Selalu ada teks.
- Setiap empty state menyebut sebab dan langkah berikutnya.
- Target sentuh minimal 44px, fokus keyboard terlihat, dan `prefers-reduced-motion` dihormati.
- Tidak ada marquee atau animasi yang berjalan terus. Ticker di header bersifat statis.
- Konten utama tetap terlihat tanpa JavaScript. Animasi reveal hanya memperhalus kemunculan, bukan menyembunyikan konten secara permanen.

## 7. Struktur panel

- Sidebar dikelompokkan: **Toko** (Ringkasan, Produk, Pesanan, Kategori) dan **Sistem** (Rules WA, Pengaturan).
- Di layar kecil, navigasi menjadi panel yang dibuka lewat tombol Menu, bisa ditutup dengan Escape, dan fokus kembali ke tombol.
- Ringkasan dimulai dari antrean tindakan, bukan dari kartu statistik.
- Metrik ditampilkan ringkas dan hanya yang dipakai untuk mengambil keputusan.
