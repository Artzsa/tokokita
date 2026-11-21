import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BotRuleForm } from "@/components/admin/bot-rule-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Aturan baru" };

export default async function NewBotRulePage() {
  await requireAdmin();
  const count = await prisma.botRule.count();

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="border-b border-line pb-6">
        <Link
          href="/admin/rules"
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-ink"
        >
          <ArrowLeft size={13} />
          Kembali ke rules
        </Link>
        <h1 className="display mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)]">
          Aturan baru
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Isi kata kunci dan jawaban yang akan dipakai bot.
        </p>
      </header>

      <div className="mt-6 max-w-2xl">
        <BotRuleForm initial={{ id: "", keywords: "", answer: "", enabled: true, position: count + 1 }} />
      </div>
    </div>
  );
}
