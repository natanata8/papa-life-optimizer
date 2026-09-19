import { scenarios } from "@/data/scenarios";
import { ScenarioCard } from "@/components/ScenarioCard";

export function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-4">
          <p className="text-sm font-medium tracking-wide">papa-life-optimizer</p>
          <p className="text-xs text-muted">仮実装 / VA 正本あり</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-accent">自分時間を、家庭の手順にする</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            家庭を止めずに、
            <br />
            自分の時間を取る
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            育児中の父親が、家族の日常を崩さずに飲み、ゲーム、ゴロゴロ、朝寝坊を実行するためのWebサービスです。いまはTOPの骨格までです。
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="mvp-scenarios">
          <div className="flex flex-col gap-1">
            <h2 id="mvp-scenarios" className="text-lg font-semibold">
              初期MVPの4シナリオ
            </h2>
            <p className="text-sm leading-6 text-muted">
              詳細フローはまだありません。選ぶ前に、家庭側で埋める穴だけ先に見ます。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-6 py-5 text-xs leading-6 text-muted">
          <p>この実装は Visual Authority の仮置きです。TOP の正本コピーは復元前提です。</p>
          <p>Production deploy は禁止。正本は GitHub latest main / docs / Issues / PRs です。</p>
        </div>
      </footer>
    </div>
  );
}
