import type { Metadata } from "next";
import Link from "next/link";
import { Check, MessageSquareText, Plus, Power, Trash2 } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureDefaultRules } from "@/lib/rules";
import { deleteBotRuleAction, toggleBotRuleAction } from "@/lib/actions/admin-actions";

export const metadata: Metadata = { title: "Rules WA" };

export default async function AdminRulesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireAdmin();
  await ensureDefaultRules();
  const params = await searchParams;
  const rules = await prisma.botRule.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="px-5 py-8 md:px-10 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Bot WhatsApp</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,3.4vw,2.8rem)]">
            Rules WA
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Atur jawaban otomatis bot. Urutan menentukan prioritas; rule pertama
            yang cocok akan dipakai.
          </p>
        </div>
        <Link href="/admin/rules/baru" className="btn btn-solid">
          <Plus size={14} />
          Aturan baru
        </Link>
      </header>

      {params.saved === "1" ? (
        <p className="mt-5 flex items-center gap-2 border border-moss/30 bg-moss/5 px-4 py-3 text-[13px] text-moss">
          <Check size={15} />
          Aturan berhasil disimpan.
        </p>
      ) : null}
      {params.deleted === "1" ? (
        <p className="mt-5 flex items-center gap-2 border border-line bg-paper-deep/50 px-4 py-3 text-[13px] text-ink-soft">
          <Trash2 size={15} />
          Aturan sudah dihapus.
        </p>
      ) : null}

      {rules.length === 0 ? (
        <div className="mt-10 border border-dashed border-line px-6 py-14 text-center">
          <p className="display text-2xl">Belum ada aturan.</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Tambah aturan pertama supaya bot tahu bagaimana membalas pertanyaan.
          </p>
          <Link href="/admin/rules/baru" className="btn btn-solid mt-6">
            <Plus size={14} />
            Aturan baru
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="py-3 pr-4 font-semibold">Urutan</th>
                <th className="py-3 pr-4 font-semibold">Kata kunci</th>
                <th className="py-3 pr-4 font-semibold">Jawaban</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-line text-[13px] transition-colors hover:bg-paper-deep/30"
                >
                  <td className="py-3 pr-4 tabular-nums text-muted">
                    {rule.position}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="max-w-[220px] truncate font-medium">
                      {rule.keywords}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="max-w-[360px] truncate text-muted">
                      {rule.answer}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <form action={toggleBotRuleAction}>
                      <input type="hidden" name="id" value={rule.id} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={rule.enabled ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          rule.enabled
                            ? "border-moss/40 bg-moss/5 text-moss"
                            : "border-line bg-paper-deep text-muted"
                        }`}
                      >
                        <Power size={11} />
                        {rule.enabled ? "Aktif" : "Nonaktif"}
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/rules/${rule.id}`}
                        className="link-underline text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft"
                      >
                        Ubah
                      </Link>
                      <details className="relative">
                        <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-muted hover:text-clay">
                          Hapus
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-56 border border-line bg-paper p-3 shadow-sm">
                          <p className="text-[11px] leading-relaxed text-muted">
                            Hapus aturan ini dari bot?
                          </p>
                          <form action={deleteBotRuleAction} className="mt-3">
                            <input type="hidden" name="id" value={rule.id} />
                            <button type="submit" className="btn btn-ghost w-full">
                              Ya, hapus
                            </button>
                          </form>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 max-w-2xl border border-line bg-paper p-5">
        <div className="flex items-center gap-2">
          <MessageSquareText size={16} className="text-clay" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Aturan baru dari sini
          </h2>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted">
          Klik &quot;Aturan baru&quot; untuk menambah. Bot membaca ulang rules aktif
          setiap kali ada chat masuk.
        </p>
      </div>
    </div>
  );
}
