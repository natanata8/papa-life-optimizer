# 公開デモ

ログイン無しの静的サイトです。サンプルの家族で開き、Supabase も OpenAI も呼びません。相談は場面ごとのサンプルで、自由文は汎用のサンプルです。安全の判定はブラウザの中で行います。お便りの写真はアップロードせず、サンプルの予定を出します。

`main` には入れません。出す場所は `gh-pages` ブランチのルートです。

## 作る

```bash
cd app
npm ci
npm run build:demo
```

`dist/` に静的ファイル、空の `.nojekyll`、`index.html` のコピー `404.html` が入ります。基準パスは `/papa-life-optimizer/` です。URL や anon key が残っていると、このコマンドは失敗します。

## 出す

```bash
cd app
npm run publish:demo
```

`gh-pages` だけを置き換えます。GitHub の Pages を、このブランチのルートに向けてください。

## 手元で見る

`dist` を `papa-life-optimizer` というディレクトリに置き、その親を静的サーバで開きます。

```bash
mkdir -p /tmp/haregoto-demo/papa-life-optimizer
cp -a dist/. /tmp/haregoto-demo/papa-life-optimizer/
python3 -m http.server 4173 --directory /tmp/haregoto-demo
```

ブラウザは `http://127.0.0.1:4173/papa-life-optimizer/` です。

## 余白の分数（目安・要調整）

引き受けたときに家へ戻る分数は、`src/domain/freed.ts` の `FREED_MIN` だけを見ます。画面では必ず「（目安）」と書きます。主語は家です。

| 種類 | 分 |
| --- | ---: |
| お風呂・飲み会のあとのお風呂（bath / party） | 30 |
| 持ち物（prep） | 15 |
| 子どもの予定（child） | 15 |
| 迎え（pickup） | 20 |
| 残業（overtime） | 30 |
| 予定の前後（event） | 20 |
| 送り（leave） | 15 |

画面は「今夜の流れ」「やる」「相談」「予定」「うち」です。引き受けた手順のチェックは、この端末の中だけに残します。相手への共有は送る文と、同じ端末の中のプレビューです。公開リンクは作りません。

今夜の流れの下に、引き受けた分の「家にN分の余白（目安）」を出します。手順の一部だけのときは、その手順の分数の合計です。週の合計は出していません。
