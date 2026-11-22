import Link from "next/link";

const ranges = [
  { value: "1d", label: "Hari ini" },
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
  { value: "all", label: "Semua" },
] as const;

export function DashboardRange({ current }: { current: string }) {
  return (
    <nav
      aria-label="Rentang waktu dashboard"
      className="flex flex-wrap gap-2"
    >
      {ranges.map((range) => {
        const active = current === range.value;
        return (
          <Link
            key={range.value}
            href={`/admin?range=${range.value}`}
            aria-current={active ? "page" : undefined}
            className={`tag ${active ? "tag-active" : "hover:border-ink"}`}
          >
            {range.label}
          </Link>
        );
      })}
    </nav>
  );
}
