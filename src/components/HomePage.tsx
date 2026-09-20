import { scenarios } from "@/data/scenarios";
import { ScenarioCard } from "@/components/ScenarioCard";

export function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
          <p className="text-sm font-medium tracking-wide">papa-life-optimizer</p>
          <p className="text-xs text-muted">仮実装 / デザイン仮説</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            papa-life-optimizer
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            育児中の父親が、自分の時間も大切にしながら家庭をうまく回すためのWebサービス
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="mvp-scenarios">
          <h2 id="mvp-scenarios" className="sr-only">
            飲みに行きたい、ゲームしたい、ソファでゴロゴロしたい、休日は朝寝坊したい
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-6 py-5 text-xs leading-6 text-muted">
          <p>この実装の見た目は仮置きです。既存 Visual はデザイン仮説であり、freeze 正本ではありません。</p>
          <p>Production deploy は禁止。正本は GitHub latest main / docs / Issues / PRs です。</p>
        </div>
      </footer>
    </div>
  );
}
