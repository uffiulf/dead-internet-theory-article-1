# Project Manager Workflow

## Oversikt

Project Manager-agenten sjekker prosjektet kontinuerlig for å sikre at oppgaver blir ferdigstilt og kritiske issues løses.

## Tilgjengelige Metoder

### 1. GitHub Actions (Automatisk)

**Fil:** `.github/workflows/pm-check.yml`

Kjører automatisk på intervaller (standard: hver time) og rapporterer status.

**Konfigurer intervall:**
```yaml
schedule:
  - cron: '0 * * * *'  # hver time klokka :00
  # Andre eksempler:
  - cron: '0 */6 * * *'  # hver 6. time
  - cron: '0 9 * * 1-5'  # hverdager kl 09:00
```

**Kjør manuelt:**
Gå til "Actions" tab i GitHub repo → "Project Manager Check" → "Run workflow"

### 2. Lokalt NPM Script

**Kommando:**
```bash
npm run pm:status
```

**Output:**
- Oversikt over åpne/kritiske issues
- Siste aktivitet fra agenter
- Advarsel hvis kritiske issues finnes
- Exit code 1 hvis kritiske issues (kan brukes i CI/CD)

**Eksempel output:**
```
📊 PROJECT MANAGER STATUS CHECK
==================================================
OVERVIEW:
  Open issues: 5 ⚠️
  Critical findings: 2 🔴
  
⚠️ ADVARSEL: Kritiske issues krever umiddelbar oppmerksomhet!
```

### 3. I Cursor Chat (Manuelt)

Si til meg:
- **"PM-oppdatering"** - Jeg sjekker status og rapporterer
- **"PM-følg opp"** - Jeg følger opp spesifikke tasks
- **"PM-review"** - Full gjennomgang av prosjektet

## Hva PM-Agenten Gjør

### Per Sjekk:
1. **Les agent-log.json** - Henter alle entries og findings
2. **Analyser åpne issues** - Tell kritiske vs medium
3. **Vurder status** - Sjekk om tidsfrister er blitt brutt
4. **Rapporter** - Gi oversikt over hva som må gjøres

### Når Kritiske Issues Funkes:
1. **Prioriter** - Sorter issues etter severity
2. **Deleger** - Vært oppgave til best egen agent
3. **Følg opp** - Sjekk status etter X timer
4. **Oppdater log** - Legg til ny PM-entry med status

## Intervall-anbefalinger

| Situasjon | Intervall |
|-----------|-----------|
| Aktivt prosjekt | 6-12 timer |
| Stabil produksjon | 24 timer |
| Testing/QA-fase | 4-6 timer |
| Kritiske bugs | 2 timer |

## Integrasjon med Andre Systemer

### CI/CD Pipeline:
```yaml
- name: Check project status
  run: npm run pm:status
  
- name: Fail if critical issues
  if: failure()
  run: |
    echo "Pipeline failed due to critical issues"
    exit 1
```

### Slack/Discord Notifications:
GitHub Actions kan sende varsler til Slack når kritiske issues finnes.

### Merge Protection:
Konfigurer branch protection rules i GitHub som krever at PM-check må passere før merge.

## Eksempel PM-Entry

Se `entry-002` i `agent-log.json` for eksempel på hvordan PM-agenten logger sitt arbeid.

## FAQ

**Q: Hvor ofte bør jeg kjøre PM-check?**  
A: Avhengig av aktivitet. Aktive prosjekter: 2-4 ganger daglig.

**Q: Hva hvis GitHub Actions ikke kjører?**  
A: Bruk lokalt script eller be meg sjekke manuelt i chat.

**Q: Kan jeg ha flere PM-agenter?**  
A: Ja, men anbefaler én hoved-PM og eventuelt spesialiserte (f.eks. Security-PM, Performance-PM).

**Q: Hvordan vet jeg at PM-checklisten har kjørt?**  
A: GitHub Actions gir notifications, eller sjekk "Actions" tab. For lokalt script, se terminal output.

