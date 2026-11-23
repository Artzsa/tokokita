import type { Metadata } from "next";
import { BotConnectPanel } from "@/components/admin/bot-connect-panel";
import { BusinessSettingsForm } from "@/components/admin/business-settings-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();


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

      <div className="mt-6 max-w-3xl space-y-6">
        <BusinessSettingsForm initial={settings} />
        <BotConnectPanel />
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
