import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s — Panel Toko Kita" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <AdminNav name={admin.name} email={admin.email} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
