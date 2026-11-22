import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel Toko Kita" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const pendingCount = await prisma.order.count({ where: { status: "pending" } });

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <a
        href="#panel-konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-paper"
      >
        Lewati ke konten panel
      </a>
      <AdminNav
        name={admin.name}
        email={admin.email}
        pendingCount={pendingCount}
      />
      <main id="panel-konten" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
