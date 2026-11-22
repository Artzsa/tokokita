import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

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

  for (const product of products) {
    const fileName = `${product.slug}.jpg`;

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
              alt: `${product.name}, foto produk`,
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
