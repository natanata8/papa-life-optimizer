# papa-life-optimizer

育児中の父親が、自分の時間も大切にしながら家庭をうまく回すためのWebサービス

初期 MVP の対象は次の 4 シナリオだけです。

- 飲みに行きたい
- ゲームしたい
- ソファでゴロゴロしたい
- 休日は朝寝坊したい

## 正本

GitHub の latest `main` / `docs/` / Issues / PRs を正本にします。
`main` への直接 push と Production deploy は禁止です。変更は branch から PR で出します。

## 技術構成

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## 起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) で TOP の骨格を確認します。

```bash
npm test
npm run lint
npm run build
```

Production への deploy はしないでください。

## ドキュメント

作業前に、エージェントは次を読みます。

1. [docs/CURRENT_HANDOFF.md](docs/CURRENT_HANDOFF.md)
2. [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md)
3. [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)
4. [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)
5. [docs/DECISIONS.md](docs/DECISIONS.md)

関連資料:

- [AGENTS.md](AGENTS.md)
- [docs/visual-authority/README.md](docs/visual-authority/README.md)
- [docs/USER_RESEARCH.md](docs/USER_RESEARCH.md)
- [docs/MARKET_RESEARCH.md](docs/MARKET_RESEARCH.md)
- [docs/MONETIZATION.md](docs/MONETIZATION.md)

## 運用

- 見た目の正本は [docs/visual-authority/](docs/visual-authority/README.md) です。朝寝坊 / 飲み会 / ソファ / ゲームは freeze、TOP は Visual approved です。画像未着なので代替画像は置かず、現行の仮 Visual はまだ寄せません。
- `HUMAN_REQUIRED` 以外は止めずに進みます。
- 完了時は changed files / tests / branch / commit / PR / blockers / HUMAN_REQUIRED を報告します。
