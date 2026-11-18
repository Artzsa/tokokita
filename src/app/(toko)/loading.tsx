export default function StorefrontLoading() {
  return (
    <div className="wrap animate-pulse pt-12 md:pt-16">
      <div className="h-3 w-28 bg-sand/70" />
      <div className="mt-6 h-14 w-3/4 max-w-xl bg-sand/70" />
      <div className="mt-4 h-4 w-1/2 max-w-md bg-sand/50" />

      <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item}>
            <div className="aspect-[4/5] bg-sand/50" />
            <div className="mt-4 h-4 w-2/3 bg-sand/60" />
            <div className="mt-2 h-3 w-1/2 bg-sand/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
