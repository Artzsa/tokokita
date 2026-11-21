"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type Customer = {
  phone: string;
  name: string;
  count: number;
  latestOrder: string;
};

export function KnownCustomers({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.phone.toLowerCase().includes(q) ||
        customer.name.toLowerCase().includes(q) ||
        customer.latestOrder.toLowerCase().includes(q),
    );
  }, [customers, query]);

  return (
    <section className="border border-line bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Nomor yang bisa dibalas bot
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Diambil otomatis dari pesanan. Bot hanya membalas chat pribadi dari
            nomor-nomor ini.
          </p>
        </div>
        <label className="relative block w-full max-w-xs">
          <span className="sr-only">Cari nomor, nama, atau pesanan</span>
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nomor, nama, atau pesanan…"
            className="input pl-9"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 border-t border-line py-8 text-[13px] text-muted">
          {customers.length === 0
            ? "Belum ada pelanggan yang checkout. Daftar ini akan terisi otomatis."
            : "Tidak ada nomor yang cocok dengan pencarian."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                <th className="py-3 pr-4 font-semibold">Nomor</th>
                <th className="py-3 pr-4 font-semibold">Nama</th>
                <th className="py-3 pr-4 text-right font-semibold">Pesanan</th>
                <th className="py-3 font-semibold">Pesanan terakhir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr
                  key={customer.phone}
                  className="border-b border-line text-[13px]"
                >
                  <td className="py-3 pr-4 font-mono text-[12px]">
                    {customer.phone}
                  </td>
                  <td className="py-3 pr-4">{customer.name}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {customer.count}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-muted">
                    {customer.latestOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Daftar ini dibaca dari tabel Order. Kalau pelanggan baru checkout, nomornya
        otomatis muncul di sini setelah halaman dimuat ulang.
      </p>
    </section>
  );
}
