"use client";

import { useEffect, useRef, useState } from "react";

export function StatCounter({
  value,
  label,
  suffix = "",
  dark = false,
}: {
  value: number;
  label: string;
  suffix?: string;
  dark?: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1100;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.round(value * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="px-5 py-6 text-center">
      <div
        className={`font-display text-4xl font-bold sm:text-5xl ${
          dark ? "text-white" : "text-navy"
        }`}
      >
        {display.toLocaleString("en-US")}
        {suffix}
      </div>
      <div
        className={`mt-1.5 text-sm font-medium tracking-wide ${
          dark ? "text-white/60" : "text-ink-muted"
        }`}
      >
        {label}
      </div>
      <div className="mx-auto mt-3 h-0.5 w-8 rounded-full bg-gold" />
    </div>
  );
}
