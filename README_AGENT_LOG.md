# Agent Log System - Quick Start

## Hva er dette?

Et system for å loggføre og vise arbeid fra forskjellige AI-agenter på prosjektet. Fungerer som en kombinert commit-log og issue-tracker.

## Hvor ser jeg loggen?

**I nettsiden:** Klikk på den blå "Agent Log" knappen i nedre høyre hjørne.

**I filene:**
- `agent-log.json` - Hovedloggfilen (rediger denne)
- `public/agent-log.json` - Kopi for nettleser (synkroniseres automatisk ved build)
- `AGENT_LOG_README.md` - Full dokumentasjon

## Hvordan legger jeg til en ny entry?

1. Åpne `agent-log.json`
2. Finn `entries`-arrayet
3. Legg til ny entry med neste ID (`entry-002`, `entry-003`, etc.)
4. Oppdater `lastUpdated` timestamp
5. Synkroniser til `public/agent-log.json`:
   - **Automatisk:** Kjør `npm run build` (kjører automatisk før build)
   - **Manuelt:** Kjør `npm run sync-agent-log` for umiddelbar synkronisering

### Eksempel-entry:

```json
{
  "id": "entry-002",
  "timestamp": "2025-10-31T16:30:00Z",
  "agent": "Frontend-Developer-Agent",
  "agentType": "frontend",
  "category": "feature",
  "title": "Lagt til Agent Log Viewer komponent",
  "status": "completed",
  "description": "Implementert AgentLogViewer komponent med søk, filtre og detaljvisning",
  "actions": [
    {
      "action": "create-component",
      "result": "success",
      "details": "Opprettet src/components/log/AgentLogViewer.tsx"
    }
  ],
  "findings": [],
  "comments": [
    {
      "id": "comment-003",
      "timestamp": "2025-10-31T16:30:00Z",
      "agent": "Frontend-Developer-Agent",
      "comment": "Komponenten støtter nå søk, filtre etter agent-type/kategori/status, og viser detaljer når man klikker på entries."
    }
  ],
  "filesAffected": [
    "src/components/log/AgentLogViewer.tsx",
    "src/components/log/AgentLogToggle.tsx",
    "src/App.tsx"
  ],
  "relatedIssues": []
}
```

## Agent-typer

- `frontend` - UI/UX, React, styling
- `backend` - API, databases, logikk
- `devops` - Deploy, CI/CD, infrastruktur
- `tester` - Testing, QA
- `quality-assurance` - Code review, linting, kvalitet
- `developer` - Generell utvikling
- `designer` - Design

## Kategorier

- `inspection` - Gjennomgang, review
- `bugfix` - Feilretting
- `feature` - Ny funksjonalitet
- `refactor` - Omstrukturering
- `documentation` - Dokumentasjon
- `optimization` - Ytelsesforbedring
- `security` - Sikkerhet
- `accessibility` - Tilgjengelighet

## Status

- `completed` - Fullført ✅
- `in-progress` - Pågående 🔄
- `blocked` - Blokkert 🚫
- `cancelled` - Avbrutt ❌

## Se også

- `AGENT_LOG_README.md` - Full dokumentasjon
- `QC_RAPPORT.md` - QC-rapport fra første agent

