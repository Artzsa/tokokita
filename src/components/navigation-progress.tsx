"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const timeout = useRef<number | null>(null);
  const poll = useRef<number | null>(null);

  const clear = useCallback(() => {
    const node = wrap.current;
    if (node) {
      node.classList.remove("is-active");
      node.setAttribute("aria-hidden", "true");
    }
    if (status.current) status.current.textContent = "";
    if (timeout.current) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (poll.current) {
      window.clearInterval(poll.current);
      poll.current = null;
    }
  }, []);

  useEffect(() => {
    clear();
  }, [pathname, clear]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      const node = wrap.current;
      if (!node) return;

      node.classList.add("is-active");
      node.setAttribute("aria-hidden", "false");
      if (status.current) status.current.textContent = "Memuat halaman";

      const start = window.location.href;
      if (poll.current) window.clearInterval(poll.current);
      poll.current = window.setInterval(() => {
        if (window.location.href !== start) clear();
      }, 120);

      if (timeout.current) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(clear, 15000);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clear();
    };
  }, [clear]);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="tk-progress-wrap pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
    >
      <div className="tk-progress h-full bg-clay" />
      <span ref={status} className="sr-only" role="status" aria-live="polite" />
    </div>
  );
}
