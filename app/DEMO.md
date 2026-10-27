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
