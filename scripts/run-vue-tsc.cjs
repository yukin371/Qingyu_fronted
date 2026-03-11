const { spawnSync } = require('node:child_process')

const result =
  process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npx vue-tsc --noEmit -p tsconfig.app.json'], {
        stdio: 'inherit',
      })
    : spawnSync('npx', ['vue-tsc', '--noEmit', '-p', 'tsconfig.app.json'], {
        stdio: 'inherit',
      })

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
