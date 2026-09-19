import type { Scenario } from "@/data/scenarios";

const statusLabel: Record<Scenario["status"], string> = {
  skeleton: "骨格",
};

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-snug text-foreground">
          {scenario.title}
        </h2>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {statusLabel[scenario.status]}
        </span>
      </div>
      <p className="text-base leading-7 text-foreground">{scenario.desire}</p>
      <dl className="grid gap-2 text-sm leading-6 text-muted">
        <div>
          <dt className="font-medium text-foreground">家庭側で先に埋めること</dt>
          <dd>{scenario.familyPrep}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">目安時間</dt>
          <dd>{scenario.duration}</dd>
        </div>
      </dl>
    </article>
  );
}
