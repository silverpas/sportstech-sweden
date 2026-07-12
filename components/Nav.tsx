"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/companies", label: "Companies" },
  { href: "/investors", label: "Investors" },
  { href: "/incubators", label: "Incubators" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent (merged into the dark hero) only on the homepage, at the very
  // top, with the mobile menu closed. Otherwise a solid white bar.
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "border-b border-line bg-surface/90 backdrop-blur"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold font-display text-lg font-bold text-navy-900">
            S
          </span>
          <span
            className={`font-display text-lg font-semibold ${
              transparent ? "text-white" : "text-ink"
            }`}
          >
            SportsTech <span className="text-gold">Sweden</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            const base = transparent
              ? active
                ? "text-white"
                : "text-white/70 hover:text-white"
              : active
                ? "text-navy"
                : "text-ink-soft hover:text-ink";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition ${base}`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
          <Link
            href="/submit"
            className={`ml-2 text-sm ${transparent ? "btn-gold" : "btn-primary"} !py-2`}
          >
            Add your startup
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={transparent ? "text-white/85 md:hidden" : "text-ink-soft md:hidden"}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-surface md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-ink-soft hover:bg-page"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/submit" onClick={() => setOpen(false)} className="btn-primary mt-1 text-sm">
              Add your startup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
