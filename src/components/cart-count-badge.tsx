export function CartCountBadge({ count }: { count: number }) {
  return (
    <span
      className={`flex size-5 items-center justify-center rounded-full bg-ink text-[10px] text-paper transition-colors group-hover:bg-clay ${
        count > 0 ? "tk-count-pop" : ""
      }`}
    >
      {count}
    </span>
  );
}
