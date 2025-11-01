#!/usr/bin/env node

/**
 * Project Manager Status Check
 * Kjøres med: node scripts/pm-status.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const logPath = join(__dirname, '..', 'agent-log.json')
  const logData = JSON.parse(readFileSync(logPath, 'utf8'))

  console.log('\n📊 PROJECT MANAGER STATUS CHECK')
  console.log('='.repeat(50))
  console.log(`Last updated: ${logData.lastUpdated}`)
  console.log('')

  // Statistikk
  const stats = logData.statistics
  console.log('OVERVIEW:')
  console.log(`  Total entries: ${stats.totalEntries}`)
  console.log(`  Open issues: ${stats.openFindings} ⚠️`)
  console.log(`  Critical findings: ${stats.criticalFindings} 🔴`)
  console.log(`  Medium findings: ${stats.mediumFindings} 🟡`)
  console.log(`  Resolved: ${stats.resolvedFindings} ✅`)
  console.log('')

  // Åpne issues
  if (logData.openIssues && logData.openIssues.length > 0) {
    console.log('OPEN ISSUES:')
    logData.openIssues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue.summary} (${issue.priority})`)
    })
    console.log('')
  }

  // Siste entries
  const recentEntries = logData.entries
    .slice(0, 3)
    .map(e => `  - ${e.agent} (${e.status}): ${e.title}`)
  
  if (recentEntries.length > 0) {
    console.log('RECENT ACTIVITY:')
    recentEntries.forEach(entry => console.log(entry))
    console.log('')
  }

  // Advarsel for kritiske issues
  if (stats.criticalFindings > 0) {
    console.log('⚠️  ADVARSEL: Kritiske issues krever umiddelbar oppmerksomhet!')
    console.log('')
  }

  // Exit code
  process.exit(stats.criticalFindings > 0 ? 1 : 0)

} catch (error) {
  console.error('❌ Kunne ikke lese agent-log.json:', error.message)
  process.exit(1)
}

