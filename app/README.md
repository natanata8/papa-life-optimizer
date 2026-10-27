# ハレゴト

パパの家のことを、晴れごとに。見えない家事・育児を、晴れた気持ちで回ることに。個人の予定から家に残る負荷を見て、次の一手と声かけ例を出します。採点も、パートナーとの比べっこもしません。

画面は日本語です。幅 390px のスマホを先に見てください。PWA の manifest を同梱しています。

## スタック

Vite + React + TypeScript + Tailwind の静的アプリです。GitHub Pages にそのまま置けて、サーバ代がかかりません。データベース、ログイン、Edge Function は Supabase に寄せています。OpenAI の鍵はブラウザに置きません。

環境変数が無いときは、このブラウザの localStorage と、6場面のサンプル回答で動きます。

## 起動

```bash
cd app
npm i
npm run dev
```

http://localhost:5173 を開きます。メールアドレスは要りません。

デモ用の帯で、朝・昼・帰宅前・夜・金曜夜を切り替えられます。「最初から」でサンプルの家族に戻ります。本番に近い表示にするときは `VITE_DEMO_MODE=false` です。そのときは東京の時刻から時間帯を決めます。

## いまモックのもの

- 相談の答えは、決まった6場面（残業と、怒られたときを含む）のサンプルです。画面に「サンプル回答」と出ます。すぐ相談の6つは暫定で、並びは `QUICK_PRESET_IDS` で入れ替えられます。
- 今日の画面の上にオウチ予報を出します。朝・昼・夕方・夜の家の負荷の見立てで、AI は呼びません。忙しい枠は多くても2つで、それぞれ「なぜ」と傘（本人が変えられる一手）が付きます。静かな日は「今日は晴れ。特にやることなし」だけです。通知の見本は、雨の枠か、ふりかえり待ちがあるときだけです。
- 相談の回数だけを `usage_events` に残す migration を置いています。自由文も名前も入れません。ライブの Supabase には入れていません。
- 今日の画面は、その下に、やること、子どもの予定、気づいておきたい日、送るメッセージ、今週末の提案の順です。登録した日は `nice_events`、子どもの予定は `child_events` に残します。Supabase では `supabase db push` でこの表も入ります。
- お便りや予約票の読み取りは、モックではサンプルの候補を出します。画像は保存しません。Supabase では `extract-schedule` を呼び、確認してから保存します。
- 通知は今日の画面の見本だけです。スマホへの通知は準備中で、プッシュは送りません。
- カレンダーの日表示に、仕事中の「妻の1日」を推定で出します。タスク一覧と子どもの予定からの目安で、編集もチェックもできません。
- お出かけは下のタブです。今週末・雨の日・近場で絞れます。中身はサンプルで、出典用の項目だけ先に置いています。
- カレンダーの書き出しは、Google カレンダーのリンク、.ics、LINE の共有リンクです。自動では送りません。
- 家族のデータは、Supabase を選ぶまでこのブラウザだけに残ります。

暴力・脅し・死にたいなどの語（STOP）は AI を呼ばず、110 / #8008 / 189 を出します。死にたい・消えたい・自殺・死のうのときは 0570-064-556 と 0120-279-338 も出します。怖い・限界などの語（CARE）は相談を続け、同じ番号の小さな案内を答えの上に出します。これ以外の番号は出しません。

## Supabase と OpenAI

`.env.example` を `.env` にコピーします。

1. Supabase でプロジェクトを作る。
2. `supabase link` のあと `supabase db push` で `supabase/migrations` を入れる。新規ユーザー用の trigger が、家族の行を作ります。
3. タスク 408 件を入れる。

```bash
npm run seed:tasks
# リモートへ入れるときだけ、鍵はシェルに渡す（ファイルに書かない）
SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... npm run seed:tasks
```

`seed:tasks` は `supabase/seed.sql` を作り直します。`raw` 列は保存しません。

4. Edge Function を置く。

```bash
supabase secrets set OPENAI_API_KEY=... OPENAI_MODEL=gpt-6-luna CONSULT_DAILY_CAP=20 EXTRACT_DAILY_CAP=10
supabase functions deploy consult
supabase functions deploy extract-schedule
```

既定のモデルは `gpt-6-luna`（いちばん安い）です。`OPENAI_MODEL` で上書きできます。静的なシステムプロンプトを先頭に固定し、家庭の事実は次のメッセージに載せます。相談は1ユーザーあたり、東京の日付で1日20回までです。お便りの読み取りは別に1日10回までです。どちらも `consult_usage` 表（Edge Function だけが書ける）で数えます。読み取りは `status = extract:ok` だけを数えるので、相談の20回には入りません。クライアントから消して戻すことはできません。安全の案内は回数に入れません。画像は保存しません。

OpenAI の鍵は Edge Function の secret `OPENAI_API_KEY` を優先し、無ければ Vault の `openai_api_key` を service role 専用の `public.consult_openai_key()` で読みます。

5. クライアントを切り替える。

```
VITE_DATA=supabase
VITE_AI=supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=公開してよい publishable key（sb_publishable_...）
```

anon key はブラウザに載ります。service role と OpenAI の鍵はサーバ側だけです。

## GitHub Pages

`.github/workflows/app-pages.yml` が `app/` をビルドします。main への push で Pages に出します。PR ではビルドと lint だけです。

リポジトリの Settings → Pages → Source を **GitHub Actions** にしてください。ベースパスは `/リポジトリ名/` です。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバ |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` |
| `npm run build` | 型チェックと本番ビルド |
| `npm run seed:tasks` | タスク SQL の再生成（鍵があれば投入） |
| `npm run shoot` | 390×844 の画面キャプチャ |
