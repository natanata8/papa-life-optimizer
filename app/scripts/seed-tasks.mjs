import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'supabase/seed/tasks.source.json')
const outPath = join(root, 'supabase/seed.sql')

const source = JSON.parse(readFileSync(sourcePath, 'utf8'))
const tasks = source.tasks ?? []
if (!Array.isArray(tasks) || tasks.length === 0) {
  console.error('tasks.source.json に tasks がありません')
  process.exit(1)
}

const columns = [
  'id',
  'major',
  'category',
  'visibility',
  'group_name',
  'title',
  'stage',
  'frequency',
  'duration',
  'difficulty',
  'owner_hint',
  'tag',
  'invisible',
  'duration_min',
  'source',
]

function sqlText(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`
}

function row(task) {
  const values = [
    sqlText(task.id),
    sqlText(task.major),
    sqlText(task.category),
    sqlText(task.visibility),
    sqlText(task.group),
    sqlText(task.title),
    sqlText(task.stage),
    sqlText(task.frequency),
    sqlText(task.duration),
    sqlText(task.difficulty),
    sqlText(task.owner),
    sqlText(task.tag),
    task.invisible ? 'true' : 'false',
    String(Number(task.duration_min_est) || 0),
    sqlText(task.source),
  ]
  return `(${values.join(', ')})`
}

const chunks = []
for (let index = 0; index < tasks.length; index += 40) {
  const slice = tasks.slice(index, index + 40)
  chunks.push(
    `insert into public.tasks (${columns.join(', ')}) values\n${slice.map(row).join(',\n')}\non conflict (id) do update set\n${columns
      .filter((column) => column !== 'id')
      .map((column) => `  ${column} = excluded.${column}`)
      .join(',\n')};`,
  )
}

const sql = `-- 家事・育児タスク一覧 ${tasks.length}件。npm run seed:tasks で再生成する。\n-- raw は保存しない。\n\n${chunks.join('\n\n')}\n`
writeFileSync(outPath, sql)
console.log(`wrote ${outPath} (${tasks.length} tasks)`)

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.log('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が無いので、SQLファイルだけ作りました。')
  process.exit(0)
}

const payload = tasks.map((task) => ({
  id: task.id,
  major: task.major ?? '',
  category: task.category ?? '',
  visibility: task.visibility ?? '',
  group_name: task.group ?? '',
  title: task.title ?? '',
  stage: task.stage ?? '',
  frequency: task.frequency ?? '',
  duration: task.duration ?? '',
  difficulty: task.difficulty ?? '',
  owner_hint: task.owner ?? '',
  tag: task.tag ?? '',
  invisible: Boolean(task.invisible),
  duration_min: Number(task.duration_min_est) || 0,
  source: task.source ?? '',
}))

for (let index = 0; index < payload.length; index += 80) {
  const batch = payload.slice(index, index + 80)
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/tasks?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(batch),
  })
  if (!response.ok) {
    const text = await response.text()
    console.error(`upsert failed ${response.status}: ${text.slice(0, 400)}`)
    process.exit(1)
  }
  console.log(`upserted ${Math.min(index + 80, payload.length)}/${payload.length}`)
}
