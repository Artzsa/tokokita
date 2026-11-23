import type { Metadata } from "next";
import { BotConnectPanel } from "@/components/admin/bot-connect-panel";
import { BusinessSettingsForm } from "@/components/admin/business-settings-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { KnownCustomers } from "@/components/admin/known-customers";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { normalizePhone, maskPhone } from "@/lib/phone";
import { retryFailedOutboxAction } from "@/lib/actions/settings-actions";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, grouped, orders, failed] = await Promise.all([
    getSettings(),
    prisma.notificationOutbox.groupBy({
      by: ["state"],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      select: { phone: true, customerName: true, number: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notificationOutbox.findMany({
      where: { state: "failed" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        phone: true,
        message: true,
        attempts: true,
        lastError: true,
        createdAt: true,
      },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.state, row._count._all]));

  const customerMap = new Map<
    string,
    { phone: string; name: string; count: number; latestOrder: string; latestAt: Date }
  >();
  for (const order of orders) {
    const key = normalizePhone(order.phone);
    const existing = customerMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      customerMap.set(key, {
        phone: order.phone,
        name: order.customerName,
        count: 1,
        latestOrder: order.number,
        latestAt: order.createdAt,
      });
    }
  }
  const customers = [...customerMap.values()].sort(
    (a, b) => b.latestAt.getTime() - a.latestAt.getTime(),
  );

  const stats = [
    { label: "Menunggu kirim", value: counts.get("pending") ?? 0 },
    { label: "Terkirim", value: counts.get("sent") ?? 0 },
    { label: "Gagal", value: counts.get("failed") ?? 0 },
  ];

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Sistem</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
          Pengaturan
        </h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
          Atur identitas toko, pembayaran transfer, notifikasi, dan koneksi
          WhatsApp. Nilai disimpan di database dan dibaca bot pada siklus
          berikutnya.
        </p>
      </header>

      <dl className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper p-5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {stat.label}
            </dt>
            <dd className="display mt-2 text-2xl tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {failed.length > 0 ? (
        <section className="mt-6 border border-line bg-paper p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Pesan gagal
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-muted">
                {failed.length} pesan gagal setelah batas percobaan. Kirim ulang
                setelah bot tersambung. Teks yang dikirim adalah teks yang
                tersimpan saat pesan dibuat, jadi periksa dulu sebelum menekan
                kirim ulang.
              </p>
            </div>
            <form action={retryFailedOutboxAction}>
              <button type="submit" className="btn btn-ghost">
                Kirim ulang semua
              </button>
            </form>
          </div>

          <ul className="mt-4 border-t border-line">
            {failed.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-line py-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">
                    {maskPhone(row.phone)}
                    <span className="ml-2 text-[11px] font-normal text-muted">
                      · {row.attempts} percobaan · {formatDateTime(row.createdAt)}
                    </span>
                  </p>
                  <p className="mt-1 max-w-xl truncate text-[11px] text-muted">
                    {row.message}
                  </p>
                  {row.lastError ? (
                    <p className="mt-1 max-w-xl text-[11px] text-clay-deep">
                      {row.lastError}
                    </p>
                  ) : null}
                </div>
                <form action={retryFailedOutboxAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className="btn btn-ghost">
                    Kirim ulang
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 max-w-3xl space-y-6">
        <BusinessSettingsForm initial={settings} />
        <BotConnectPanel />
        <KnownCustomers customers={customers} />
        <SettingsForm initial={settings} />
        <section className="border border-line bg-paper p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Keamanan
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
            Ganti kata sandi admin. Sesi yang sedang aktif tetap berlaku sampai
            kedaluwarsa, jadi keluar dari perangkat lain setelah mengganti.
          </p>
          <div className="mt-5">
            <ChangePasswordForm />
          </div>
        </section>
      </div>

      <p className="mt-6 max-w-2xl text-[11px] leading-relaxed text-muted">
        Bot Baileys bukan API resmi WhatsApp. Gunakan dengan bijak dan jangan
        membagikan kredensial sesi yang tersimpan di folder{" "}
        <code className="bg-paper-deep px-1">bot/session/</code>.
      </p>
    </div>
  );
}
