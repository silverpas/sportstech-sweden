import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-surface">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-navy font-display text-base font-bold text-gold">
            S
          </span>
          <span className="font-display font-semibold text-ink">
            SportsTech <span className="text-navy">Sweden</span>
          </span>
        </div>
        <p className="text-sm text-ink-muted">
          Mapping the Swedish SportsTech ecosystem · {new Date().getFullYear()}
        </p>
        <div className="flex gap-4 text-sm text-ink-soft">
          <Link href="/companies" className="hover:text-navy">Companies</Link>
          <Link href="/submit" className="hover:text-navy">Submit</Link>
        </div>
      </div>
    </footer>
  );
}
