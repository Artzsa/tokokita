import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { formatDateTime, formatIDR, orderStatusLabel } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import { bankIsReady, qrisIsReady } from "@/lib/business";
import { buildDynamicQris, qrisMerchantName } from "@/lib/qris";
import { getSettings } from "@/lib/settings";
import { isPendingExpired } from "@/lib/order-expiry";
import { QrisPaymentPanel } from "@/components/qris-payment-panel";

export const metadata: Metadata = {
  title: "Pesanan",
  robots: { index: false },
};

const statusTone: Record<string, string> = {
  pending: "border-clay/40 bg-clay/5 text-clay-deep",
  paid: "border-moss/40 bg-moss/5 text-moss",
  packed: "border-moss/40 bg-moss/5 text-moss",
  shipped: "border-moss/40 bg-moss/5 text-moss",
  completed: "border-moss/40 bg-moss/5 text-moss",
  cancelled: "border-line bg-paper-deep text-muted",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;

  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: {
        include: { product: { select: { slug: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!order) notFound();

  const settings = await getSettings();
  const bankReady = bankIsReady(settings);
  const qrisReady = qrisIsReady(settings);
  const firstName = order.customerName.split(" ")[0];
  const isPending = order.status === "pending";
  const isTransfer = order.paymentMethod === "transfer";
  const isQris = order.paymentMethod === "qris";
  const orderExpired = isPendingExpired(order.createdAt);
  const qrisActive =
    isQris &&
    isPending &&
    order.paymentStatus === "unpaid" &&
    qrisReady &&
    !orderExpired;

  let qrisDataUrl = "";
  let qrisMerchant = "";
  let qrisError = "";

  if (qrisActive) {
    try {
      qrisMerchant = qrisMerchantName(settings.qrisPayload);
      const payload = buildDynamicQris({
        payload: settings.qrisPayload,
        amount: order.total,
        billNumber: order.number,
      });
      qrisDataUrl = await QRCode.toDataURL(payload, {
        width: 560,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#14100c", light: "#ffffff" },
      });
    } catch {
      qrisError =
        "QRIS belum bisa ditampilkan. Hubungi admin lewat WhatsApp untuk instruksi pembayaran.";
    }
  }

  const confirmMessage = isQris
    ? `Halo Toko Kita, saya sudah bayar QRIS untuk pesanan ${order.number} sebesar ${formatIDR(order.total)}. Ini bukti pembayarannya.`
    : `Halo Toko Kita, saya mau konfirmasi pesanan ${order.number} sebesar ${formatIDR(order.total)}.`;

  const steps = [
    {
      title: isQris
        ? "Scan dan bayar"
        : isTransfer
          ? "Siapkan pembayaran"
          : "Siapkan pembayaran di tempat",
      body: isQris
        ? qrisActive
          ? "Buka QRIS di halaman ini, scan dengan aplikasi bank atau e-wallet, lalu bayar sesuai nominal yang sudah terisi."
          : "Hubungi admin lewat WhatsApp untuk mendapatkan QRIS atau instruksi pembayaran."
        : isTransfer
          ? bankReady
            ? `Transfer ke ${settings.bankName} ${settings.bankNumber} a.n. ${settings.bankHolder}. Cantumkan nomor pesanan di berita transfer.`
            : "Minta nomor rekening lewat WhatsApp. Cantumkan nomor pesanan di pesan atau berita transfer."
          : "Bayar tunai saat kurir menyerahkan barang. Siapkan uang pas bila memungkinkan.",
    },
    {
      title: "Konfirmasi ke kami",
      body: isQris || isTransfer
        ? "Kirim bukti pembayaran lewat WhatsApp supaya pesanan bisa dicek dan disiapkan."
        : "Admin akan menghubungi lewat WhatsApp untuk memastikan alamat dan waktu pengiriman.",
    },
    {
      title: "Kami kemas dan kirim",
      body: "Admin menyiapkan paket dan mencatat pengiriman. Nomor resi dikirim lewat WhatsApp kalau sudah tersedia.",
    },
  ];

  return (
    <div className="wrap pt-12 md:pt-16">
      <header>
        <p className="eyebrow flex items-center gap-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-moss text-paper">
            <Check size={13} />
          </span>
          Pesanan dibuat
        </p>

        <h1 className="display mt-5 text-[clamp(2.4rem,5vw,3.8rem)]">
          Terima kasih, {firstName}.
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          Pesananmu sudah tercatat. Simpan nomor dan tautan halaman ini. Kamu
          bisa membukanya lagi untuk melihat status dan rincian.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="border border-line bg-paper-deep/60 px-4 py-2 font-mono text-[13px] tracking-wide">
            {order.number}
          </span>
          <span
            className={`border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              statusTone[order.status] ?? statusTone.pending
            }`}
          >
            {orderStatusLabel(order.status)}
          </span>
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <section>
            <h2 className="eyebrow">Rincian barang</h2>
            <div className="mt-4 border-t border-line">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-4 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {item.product ? (
                        <Link
                          href={`/produk/${item.product.slug}`}
                          className="hover:text-clay"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {item.variantLabel ? `${item.variantLabel} · ` : ""}
                      {item.qty} × {formatIDR(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {formatIDR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ongkir</dt>
                <dd className="tabular-nums">
                  {order.shipping === 0 ? "Gratis" : formatIDR(order.shipping)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="display text-2xl tabular-nums">
                  {formatIDR(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="eyebrow">Dikirim ke</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {order.customerName}
                <br />
                {order.address}
                <br />
                {order.city} {order.postalCode}
                <br />
                {order.phone}
              </p>
            </div>
            <div>
              <h2 className="eyebrow">Catatan</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {order.notes ?? "Tidak ada catatan tambahan."}
              </p>
            </div>
          </section>

          {isPending ? (
            <section className="mt-12">
              <h2 className="eyebrow">Langkah selanjutnya</h2>
              <ol className="mt-4 border-t border-line">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[auto_1fr] gap-4 border-b border-line py-5"
                  >
                    <span className="display text-xl text-clay">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <section className="mt-12 border border-line bg-paper-deep/40 p-6">
              <h2 className="eyebrow">Status pesanan</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Pesanan ini berstatus{" "}
                <strong className="font-medium">
                  {orderStatusLabel(order.status)}
                </strong>
                . Kalau ada yang ingin diubah, hubungi kami dengan menyebut nomor
                pesanan di atas.
              </p>
              {order.cancelReason ? (
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  Alasan: {order.cancelReason}
                </p>
              ) : null}
            </section>
          )}
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-32 lg:self-start">
          {isPending && isTransfer ? (
            <div className="border border-ink bg-ink p-6 text-paper">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/60">
                {bankReady ? "Transfer ke" : "Pembayaran transfer"}
              </p>

              {bankReady ? (
                <>
                  <p className="display mt-3 text-2xl">{settings.bankName}</p>
                  <p className="mt-4 font-mono text-lg tracking-wider">
                    {settings.bankNumber}
                  </p>
                  <p className="mt-1 text-xs text-paper/60">
                    a.n. {settings.bankHolder}
                  </p>
                  <p className="mt-3 text-[12px] leading-relaxed text-paper/70">
                    Cantumkan nomor pesanan di berita transfer, lalu kirim bukti
                    lewat WhatsApp.
                  </p>
                </>
              ) : (
                <>
                  <p className="display mt-3 text-2xl">
                    Instruksi lewat WhatsApp
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-paper/70">
                    Nomor rekening dikirim admin setelah pesanan dicek. Sebutkan
                    nomor pesanan saat menghubungi.
                  </p>
                </>
              )}

              <div className="mt-6 border-t border-paper/20 pt-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-paper/60">
                  Jumlah
                </p>
                <p className="display mt-1 text-3xl tabular-nums">
                  {formatIDR(order.total)}
                </p>
              </div>

              <a
                href={await whatsappLink(confirmMessage)}
                target="_blank"
                rel="noreferrer"
                className="btn mt-6 w-full border-paper bg-paper text-ink hover:border-clay hover:bg-clay hover:text-paper"
              >
                <MessageCircle size={15} />
                {bankReady ? "Konfirmasi via WhatsApp" : "Minta instruksi transfer"}
              </a>
            </div>
          ) : isPending && isQris ? (
            qrisActive && qrisDataUrl ? (
              <QrisPaymentPanel
                qrDataUrl={qrisDataUrl}
                merchantName={qrisMerchant}
                orderNumber={order.number}
                amountLabel={formatIDR(order.total)}
                whatsappHref={await whatsappLink(confirmMessage)}
              />
            ) : (
              <div className="border border-line bg-paper-deep/40 p-6">
                <p className="eyebrow">QRIS</p>
                <p className="display mt-3 text-3xl tabular-nums">
                  {formatIDR(order.total)}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  {qrisError
                    ? qrisError
                    : orderExpired
                      ? "QRIS untuk pesanan ini sudah ditutup karena pesanan berumur lebih dari 3 hari."
                      : "QRIS belum tersedia di toko ini."}
                </p>
                <a
                  href={await whatsappLink(
                    `Halo Toko Kita, saya mau tanya soal pembayaran pesanan ${order.number}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost mt-6 w-full"
                >
                  <MessageCircle size={15} />
                  Hubungi admin
                </a>
              </div>
            )
          ) : (
            <div className="border border-line bg-paper-deep/40 p-6">
              <p className="eyebrow">Total pesanan</p>
              <p className="display mt-3 text-3xl tabular-nums">
                {formatIDR(order.total)}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {order.paymentMethod === "cod"
                  ? "Dibayar tunai saat barang diterima."
                  : order.paymentStatus === "paid"
                    ? "Pembayaran sudah kami terima."
                    : "Pembayaran belum kami catat. Hubungi admin kalau sudah membayar."}
              </p>
              <a
                href={await whatsappLink(
                  `Halo Toko Kita, saya mau tanya soal pesanan ${order.number}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost mt-6 w-full"
              >
                <MessageCircle size={15} />
                Tanya pesanan
              </a>
            </div>
          )}

          <div className="mt-6 border border-line p-6">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Butuh bantuan?{" "}
              <a
                href={await whatsappLink(
                  `Halo Toko Kita, saya mau tanya soal pesanan ${order.number}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="link-underline text-clay"
              >
                Tanya lewat WhatsApp
              </a>{" "}
              dengan menyebut nomor pesanan.
            </p>
          </div>

          <Link
            href="/produk"
            className="link-underline mt-8 inline-flex items-center gap-2 text-[12px] font-medium text-ink-soft"
          >
            Lanjut belanja
            <ArrowRight size={13} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
