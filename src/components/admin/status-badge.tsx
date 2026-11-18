const tones: Record<string, string> = {
  pending: "border-clay/40 bg-clay/5 text-clay-deep",
  paid: "border-moss/40 bg-moss/5 text-moss",
  packed: "border-moss/40 bg-moss/5 text-moss",
  shipped: "border-ink/20 bg-ink/5 text-ink",
  cancelled: "border-line bg-paper-deep text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
        tones[status] ?? tones.pending
      }`}
    >
      {status === "pending"
        ? "Menunggu bayar"
        : status === "paid"
          ? "Dibayar"
          : status === "packed"
            ? "Dikemas"
            : status === "shipped"
              ? "Dikirim"
              : status === "cancelled"
                ? "Dibatalkan"
                : status}
    </span>
  );
}
