import { existsSync, mkdirSync, rmSync, cpSync } from 'fs'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const backendDir = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(backendDir, '../frontend')
const frontendDistDir = resolve(frontendDir, 'dist')
const publicDir = resolve(backendDir, 'public')

if (existsSync(frontendDir)) {
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' })

  rmSync(publicDir, { recursive: true, force: true })
  mkdirSync(publicDir, { recursive: true })
  cpSync(frontendDistDir, publicDir, { recursive: true })
  console.log(`Frontend copied to ${publicDir}`)
} else {
  console.log('Frontend folder not found. Skipping frontend build copy.')
}
