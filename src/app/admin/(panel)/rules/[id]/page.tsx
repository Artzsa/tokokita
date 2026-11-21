import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BotRuleForm, type BotRuleInitial } from "@/components/admin/bot-rule-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Ubah aturan" };

export default async function EditBotRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const rule = await prisma.botRule.findUnique({ where: { id } });
  if (!rule) notFound();

  const initial: BotRuleInitial = {
    id: rule.id,
    keywords: rule.keywords,
    answer: rule.answer,
    enabled: rule.enabled,
    position: rule.position,
  };

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
          Ubah aturan
        </h1>
        <p className="mt-2 font-mono text-[11px] text-muted">{rule.id}</p>
      </header>

      <div className="mt-6 max-w-2xl">
        <BotRuleForm initial={initial} />
      </div>
    </div>
  );
}
