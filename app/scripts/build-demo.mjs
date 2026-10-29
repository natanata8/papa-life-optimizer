import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(app, '..')
const dist = join(app, 'dist')

const env = { ...process.env }
for (const key of Object.keys(env)) {
  if (/SUPABASE|OPENAI|SECRET|ANON|SERVICE_ROLE|API_KEY|TOKEN/i.test(key)) delete env[key]
}
env.VITE_DEMO_ONLY = 'true'
env.VITE_DEMO_MODE = 'true'
env.VITE_DATA = 'local'
env.VITE_AI = 'sample'
env.VITE_BASE = '/papa-life-optimizer/'

function run(command, args, cwd = app, commandEnv = env) {
  const result = spawnSync(command, args, { cwd, env: commandEnv, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

rmSync(dist, { recursive: true, force: true })
run('npx', ['tsc', '-b'])
run('npx', ['vite', 'build'])
writeFileSync(join(dist, '.nojekyll'), '')
cpSync(join(dist, 'index.html'), join(dist, '404.html'))

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8')
if (!html.includes('noindex,nofollow')) throw new Error('index.html is missing noindex,nofollow')
if (!html.includes('/papa-life-optimizer/')) throw new Error('assets are not under /papa-life-optimizer/')
if (!robots.includes('Disallow:')) throw new Error('robots.txt does not disallow')

const banned = [/supabase\.co/i, /eyJ[A-Za-z0-9_-]{8,}/, /service_role/, /OPENAI_API_KEY/, /\bsk-[A-Za-z0-9]{8,}/, /jngichbryixklpzlkznh/]
const hits = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      walk(path)
      continue
    }
    if (!/\.(js|css|html|txt|webmanifest|json|svg|map)$/.test(name)) continue
    const text = readFileSync(path, 'utf8')
    for (const pattern of banned) {
      if (pattern.test(text)) hits.push(`${relative(dist, path)} matched ${pattern}`)
    }
  }
}
walk(dist)
if (hits.length > 0) {
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log('demo bundle has no remote credentials')

if (process.argv.includes('--push')) publish()

function git(args, cwd) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' })
}

function publish() {
  const remote = git(['remote', 'get-url', 'origin'], repo)
  if (remote.status !== 0) process.exit(remote.status ?? 1)
  const name = git(['config', 'user.name'], repo).stdout.trim()
  const email = git(['config', 'user.email'], repo).stdout.trim()
  const tmp = mkdtempSync(join(tmpdir(), 'haregoto-pages-'))
  run('git', ['init'], tmp, process.env)
  run('git', ['checkout', '-b', 'gh-pages'], tmp, process.env)
  for (const entry of readdirSync(dist)) {
    cpSync(join(dist, entry), join(tmp, entry), { recursive: true })
  }
  run('git', ['add', '-A'], tmp, process.env)
  const commit = spawnSync(
    'git',
    ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-m', 'Publish the login-free demo.'],
    { cwd: tmp, env: process.env, stdio: 'inherit' },
  )
  if (commit.status !== 0) process.exit(commit.status ?? 1)
  const added = spawnSync('git', ['remote', 'add', 'origin', remote.stdout.trim()], { cwd: tmp, env: process.env, stdio: 'inherit' })
  if (added.status !== 0) process.exit(added.status ?? 1)
  const pushed = spawnSync('git', ['push', '--force', 'origin', 'HEAD:gh-pages'], { cwd: tmp, env: process.env, stdio: 'inherit' })
  if (pushed.status !== 0) process.exit(pushed.status ?? 1)
  const hash = git(['rev-parse', 'HEAD'], tmp).stdout.trim()
  console.log(`gh-pages ${hash}`)
}
