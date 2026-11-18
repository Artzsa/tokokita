import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type Palette = {
  bg: string;
  block: string;
  accent: string;
  ink: string;
};

const palettes: Palette[] = [
  { bg: "#e9e0d0", block: "#cbb99e", accent: "#a9491f", ink: "#2e4739" },
  { bg: "#e4dccd", block: "#b9a88f", accent: "#2e4739", ink: "#171310" },
  { bg: "#efe6d6", block: "#d3c0a4", accent: "#873614", ink: "#3f4f43" },
  { bg: "#e6dfd2", block: "#c2ae92", accent: "#5b6b54", ink: "#a9491f" },
];

/**
 * Abstract "product photo" placeholder. Deliberately geometric and quiet so the
 * layout is evaluated on composition, not on stock photography.
 */
function placeholderSvg(title: string, index: number) {
  const palette = palettes[index % palettes.length];
  const shift = (index % 3) * 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500" role="img" aria-label="${title}">
  <rect width="1200" height="1500" fill="${palette.bg}"/>
  <rect x="90" y="150" width="1020" height="1200" fill="${palette.block}"/>
  <path d="M 260 ${640 + shift} A 240 240 0 0 1 740 ${640 + shift} L 740 1210 L 260 1210 Z" fill="${palette.accent}"/>
  <circle cx="${860 - shift}" cy="${420 + shift}" r="150" fill="${palette.ink}" opacity="0.92"/>
  <rect x="260" y="${400 + shift}" width="480" height="14" fill="${palette.ink}" opacity="0.5"/>
  <rect x="260" y="${440 + shift}" width="320" height="14" fill="${palette.ink}" opacity="0.35"/>
  <rect x="90" y="1350" width="1020" height="1" fill="${palette.ink}" opacity="0.25"/>
  <text x="90" y="1420" font-family="Georgia, serif" font-size="34" letter-spacing="6" fill="${palette.ink}" opacity="0.7">TOKO KITA</text>
  <text x="1110" y="1420" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="4" fill="${palette.ink}" opacity="0.5">FOTO CONTOH</text>
</svg>`;
}

type SeedProduct = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  stock: number;
  category: string;
  material: string;
  dimensions: string;
  care: string;
  origin: string;
  variants?: { label: string; sku: string; price?: number; stock: number }[];
};

const categories = [
  {
    name: "Rumah",
    slug: "rumah",
    blurb: "Perkakas meja makan dan sudut ruang yang dipakai setiap hari.",
  },
  {
    name: "Tas & Bawa",
    slug: "tas-bawa",
    blurb: "Wadah untuk membawa barang tanpa repot dan tanpa berlebihan.",
  },
  {
    name: "Meja Kerja",
    slug: "meja-kerja",
    blurb: "Alat tulis dan penerang untuk kerja yang butuh fokus.",
  },
  {
    name: "Kain",
    slug: "kain",
    blurb: "Linen dan katun tenun yang makin nyaman setelah dicuci.",
  },
];

const products: SeedProduct[] = [
  {
    name: "Gelas Tembakau",
    slug: "gelas-tembakau",
    tagline: "Gelas stoneware 220 ml dengan bibir tebal.",
    description:
      "Dibentuk manual di wheel, lalu dibakar dua kali supaya permukaannya tidak mudah retak saat kena air panas. Bibir gelas sengaja dibuat tebal supaya nyaman dipakai minum kopi tubruk. Bagian bawah rata, tidak bergoyang di meja.",
    price: 145_000,
    compareAt: 175_000,
    stock: 12,
    category: "rumah",
    material: "Stoneware lokal, glasir bebas timbal",
    dimensions: "Diameter 8 cm, tinggi 9 cm, 220 ml",
    care: "Boleh dicuci mesin. Jangan kejutkan dengan air mendidih saat gelas dingin.",
    origin: "Kasongan, Yogyakarta",
    variants: [
      { label: "Tanah liat", sku: "GLS-TANAH", stock: 6 },
      { label: "Glasir putih", sku: "GLS-PUTIH", price: 155_000, stock: 6 },
    ],
  },
  {
    name: "Nampan Kayu Jati",
    slug: "nampan-kayu-jati",
    tagline: "Nampan jati solid untuk menyajikan roti dan kopi.",
    description:
      "Satu potong jati utuh, bukan sambungan. Dihaluskan sampai 400 grit lalu diolesi minyak kelapa food-grade, jadi aman untuk menyentuh makanan langsung. Tepi dibuat miring supaya mudah diangkat dengan satu tangan.",
    price: 285_000,
    stock: 7,
    category: "rumah",
    material: "Kayu jati solid, minyak kelapa food-grade",
    dimensions: "38 × 24 × 2 cm",
    care: "Lap dengan kain lembap. Olesi minyak kayu setiap 3 bulan.",
    origin: "Jepara, Jawa Tengah",
  },
  {
    name: "Tas Kanvas Lipat",
    slug: "tas-kanvas-lipat",
    tagline: "Tote kanvas 16 oz dengan jahitan ganda di sudut.",
    description:
      "Kanvas tebal 16 oz yang kaku di awal dan melunak setelah beberapa kali dipakai. Jahitan ganda di titik tarik, tali selebar 3 cm supaya tidak memotong bahu. Ada kantong dalam untuk kunci dan dompet, ditutup kancing magnet.",
    price: 320_000,
    stock: 9,
    category: "tas-bawa",
    material: "Kanvas katun 16 oz, lining katun drill",
    dimensions: "42 × 34 × 12 cm, tali 62 cm",
    care: "Cuci tangan dengan air dingin. Jangan dikeringkan di mesin.",
    origin: "Bandung, Jawa Barat",
    variants: [
      { label: "Natural", sku: "TAS-NAT", stock: 5 },
      { label: "Arang", sku: "TAS-ARG", stock: 4 },
    ],
  },
  {
    name: "Sarung Bantal Linen",
    slug: "sarung-bantal-linen",
    tagline: "Linen cuci batu dengan ritsleting tersembunyi.",
    description:
      "Linen 100% dengan gramasi 190 gsm, dicuci batu supaya tidak kaku saat pertama dipakai. Ritsleting tersembunyi di sisi bawah, jadi tidak mengganggu wajah. Setiap kali dicuci, seratnya makin lembut.",
    price: 180_000,
    stock: 20,
    category: "kain",
    material: "Linen 100%, 190 gsm",
    dimensions: "45 × 45 cm dan 50 × 50 cm",
    care: "Cuci mesin 30°C, keringkan di tempat teduh.",
    origin: "Solo, Jawa Tengah",
    variants: [
      { label: "45 × 45 cm", sku: "LIN-45", stock: 12 },
      { label: "50 × 50 cm", sku: "LIN-50", price: 195_000, stock: 8 },
    ],
  },
  {
    name: "Lampu Meja Kaleng",
    slug: "lampu-meja-kaleng",
    tagline: "Lampu baca dengan reflektor kaleng daur ulang.",
    description:
      "Reflektor dibuat dari kaleng bekas yang dipotong dan dilipat di bengkel kecil kami. Cahaya diarahkan ke bawah, tidak menyilaukan mata. Kabel dilapisi kain, panjang 180 cm, dengan sakelar kaki.",
    price: 465_000,
    stock: 4,
    category: "meja-kerja",
    material: "Kaleng daur ulang, fitting E27, kabel kain",
    dimensions: "Tinggi 34 cm, diameter reflektor 18 cm",
    care: "Gunakan bohlam LED maksimal 9 watt. Cabut sebelum dibersihkan.",
    origin: "Yogyakarta",
  },
  {
    name: "Buku Catatan Jahit",
    slug: "buku-catatan-jahit",
    tagline: "Buku 96 halaman dengan jilid benang terbuka.",
    description:
      "Kertas bookprint 90 gsm yang tidak tembus saat memakai tinta fountain pen. Jilidnya dijahit tangan dengan benang katun, jadi buku bisa dibuka rata 180 derajat. Sampul karton abu-abu tanpa laminasi.",
    price: 95_000,
    stock: 30,
    category: "meja-kerja",
    material: "Kertas bookprint 90 gsm, benang katun",
    dimensions: "14,8 × 21 cm, 96 halaman",
    care: "Simpan di tempat kering. Jauhkan dari air.",
    origin: "Yogyakarta",
  },
  {
    name: "Kotak Rempah Rotan",
    slug: "kotak-rempah-rotan",
    tagline: "Kotak rotan anyam rapat untuk bumbu dapur.",
    description:
      "Rotan pilihan yang dianyam rapat supaya bumbu tidak tumpah ke sela. Ada tiga sekat kayu yang bisa dilepas, jadi bisa dipakai untuk rempah, alat jahit, atau kabel. Dasar dilapisi kain kanvas.",
    price: 240_000,
    stock: 6,
    category: "rumah",
    material: "Rotan alami, sekat kayu pinus",
    dimensions: "26 × 18 × 10 cm",
    care: "Bersihkan dengan kuas kering. Jangan direndam.",
    origin: "Cirebon, Jawa Barat",
  },
  {
    name: "Dompet Kulit Sisa",
    slug: "dompet-kulit-sisa",
    tagline: "Dompet lipat dari sisa kulit tas, dijahit tangan.",
    description:
      "Dibuat dari potongan kulit sisa produksi tas, jadi tiap unit warnanya bisa sedikit berbeda. Ada empat slot kartu dan satu ruang uang lipat. Jahitan tangan dengan benang lilin, tepi dibakar halus.",
    price: 275_000,
    stock: 8,
    category: "tas-bawa",
    material: "Kulit sapi nabati, benang lilin",
    dimensions: "11 × 9 cm saat terlipat",
    care: "Lap dengan kain kering. Hindari air dan panas langsung.",
    origin: "Yogyakarta",
    variants: [
      { label: "Cokelat", sku: "DMP-CKL", stock: 5 },
      { label: "Hitam", sku: "DMP-HTM", stock: 3 },
    ],
  },
];

async function main() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "seed");
  await mkdir(uploadDir, { recursive: true });

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  const admin = await prisma.admin.create({
    data: {
      email: "admin@tokokita.test",
      name: "Pengelola Toko",
      passwordHash: await hash("tokokita123", 11),
    },
  });

  const categoryIds = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const created = await prisma.category.create({
      data: { ...category, position: index },
    });
    categoryIds.set(category.slug, created.id);
  }

  const createdProducts: { id: string; name: string; price: number }[] = [];

  for (const [index, product] of products.entries()) {
    const fileName = `${product.slug}.svg`;
    await writeFile(
      path.join(uploadDir, fileName),
      placeholderSvg(product.name, index),
      "utf8",
    );

    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Kategori ${product.category} tidak ada`);

    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        tagline: product.tagline,
        description: product.description,
        price: product.price,
        compareAt: product.compareAt ?? null,
        stock: product.stock,
        status: "active",
        material: product.material,
        dimensions: product.dimensions,
        care: product.care,
        origin: product.origin,
        categoryId,
        images: {
          create: [
            {
              url: `/uploads/seed/${fileName}`,
              alt: `${product.name} — foto contoh`,
              position: 0,
            },
          ],
        },
        variants: product.variants
          ? {
              create: product.variants.map((variant) => ({
                label: variant.label,
                sku: variant.sku,
                price: variant.price ?? null,
                stock: variant.stock,
              })),
            }
          : undefined,
      },
    });

    createdProducts.push({
      id: created.id,
      name: created.name,
      price: created.price,
    });
  }

  // One historical order so the admin screens are not empty.
  const first = createdProducts[0];
  const second = createdProducts[2];
  const subtotal = first.price + second.price;

  await prisma.order.create({
    data: {
      number: "TK-261102-A1B2",
      customerName: "Rani Puspita",
      email: "rani@example.com",
      phone: "081234567890",
      address: "Jalan Kaliurang KM 7, Gang Melati 3, Sleman",
      city: "Sleman",
      postalCode: "55581",
      notes: "Tolong dibungkus kertas, tanpa plastik.",
      paymentMethod: "transfer",
      shipping: 22_000,
      subtotal,
      total: subtotal + 22_000,
      status: "paid",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      items: {
        create: [
          {
            productId: first.id,
            name: first.name,
            price: first.price,
            qty: 1,
          },
          {
            productId: second.id,
            name: second.name,
            price: second.price,
            qty: 1,
          },
        ],
      },
    },
  });

  console.log(
    `Seed selesai: ${categories.length} kategori, ${createdProducts.length} produk, 1 pesanan contoh.`,
  );
  console.log(`Admin: ${admin.email} / tokokita123`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
