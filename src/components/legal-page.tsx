import { Link } from "@tanstack/react-router";

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { h: string; p: string }[];
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--neon)]">Legal</span>
      <h1 className="mt-2 text-4xl font-bold md:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated · {updated}</p>

      <div className="mt-10 space-y-6">
        {sections.map((s) => (
          <section key={s.h} className="surface-card p-6">
            <h2 className="text-lg font-bold">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card/50 p-5 text-sm">
        Questions about this document? <Link to="/contact" className="font-medium text-[var(--neon)] hover:underline">Contact our team</Link>.
      </div>
    </div>
  );
}
