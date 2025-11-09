#!/usr/bin/env node

/**
 * Copy agent-log.json to public/agent-log.json
 * Kjøres automatisk før build, eller manuelt med: npm run sync-agent-log
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rootDir = join(__dirname, '..')
const sourceFile = join(rootDir, 'agent-log.json')
const targetFile = join(rootDir, 'public', 'agent-log.json')

try {
  if (!existsSync(sourceFile)) {
    console.error('❌ agent-log.json ikke funnet i root-mappen')
    process.exit(1)
  }

  const content = readFileSync(sourceFile, 'utf8')
  
  // Valider JSON før kopiering
  try {
    JSON.parse(content)
  } catch (err) {
    console.error('❌ agent-log.json er ikke gyldig JSON:', err.message)
    process.exit(1)
  }

  writeFileSync(targetFile, content, 'utf8')
  console.log('✅ Synkronisert agent-log.json til public/agent-log.json')
  
} catch (error) {
  console.error('❌ Kunne ikke kopiere agent-log.json:', error.message)
  process.exit(1)
}

