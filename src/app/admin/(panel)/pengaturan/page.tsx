import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, grouped] = await Promise.all([
    getSettings(),
    prisma.notificationOutbox.groupBy({
      by: ["state"],
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.state, row._count._all]));

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
          Atur notifikasi dan koneksi WhatsApp bot. Nilai disimpan di database dan
          dibaca bot langsung pada siklus berikutnya — tidak perlu edit file atau
          restart server.
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

      <div className="mt-6 max-w-3xl">
        <SettingsForm initial={settings} />
      </div>

      <p className="mt-6 max-w-2xl text-[11px] leading-relaxed text-muted">
        Bot Baileys bukan API resmi WhatsApp. Gunakan dengan bijak dan jangan
        membagikan kredensial sesi yang tersimpan di folder{" "}
        <code className="bg-paper-deep px-1">bot/session/</code>.
      </p>
    </div>
  );
}
