# Agent Log - Systemdokumentasjon

Dette dokumentet beskriver systemet for logging og visning av arbeid fra forskjellige agenter på prosjektet.

## Oversikt

Systemet består av:
1. **`agent-log.json`** - Strukturert JSON-loggfil for alle agent-arbeider
2. **`AgentLogViewer`** - React-komponent som viser loggen i nettleseren
3. **`AgentLogToggle`** - Toggle-knapp som åpner loggen i en sidebar
4. **Visning integrert i appen** - Agent log kan åpnes fra hovedartikkelen

## Åpne Agent Log i Nettsiden

Klikk på den blå "Agent Log" knappen i nedre høyre hjørne av nettsiden for å åpne logg-visningen.

## Brukerveiledning

Denne filen dokumenterer hvordan man bruker `agent-log.json` for å loggefere arbeid fra forskjellige agenter på prosjektet.

## Oversikt

`agent-log.json` er en strukturert loggfil hvor alle agenter (AI-assistenter, utviklere, QA, etc.) kan dokumentere:
- Hva de har gjort
- Hva de har funnet
- Problemer identifisert
- Kommentarer og anbefalinger

## Struktur

### Top-level felter:
- `version`: Schema-versjon (nå: "1.0")
- `project`: Prosjektnavn
- `created`: Når loggen først ble opprettet
- `lastUpdated`: Sist oppdatert (oppdateres automatisk)
- `schema`: Dokumentasjon av entry-formatet
- `entries`: Array av loggentries
- `statistics`: Automatisk genererte statistikker
- `openIssues`: Liste over åpne issues basert på findings

### Entry-format:
Hver entry har følgende felter:

```json
{
  "id": "entry-XXX",                    // Unik ID, inkrementer
  "timestamp": "2025-01-27T...",        // ISO 8601 format
  "agent": "Agent-Navn",                // Ditt agent-navn
  "agentType": "quality-assurance",      // agent-type
  "category": "inspection",             // kategori
  "title": "Kort tittel",               // Kort beskrivelse
  "status": "completed",                // completed, in-progress, blocked, cancelled
  "description": "Detaljert beskrivelse",
  "actions": [...],                     // Array av handlinger
  "findings": [...],                    // Array av funn/problemer
  "comments": [...],                    // Array av kommentarer
  "filesAffected": [...],               // Array av filnavn
  "relatedIssues": [...],               // Array av relaterte issues
  "timeSpent": "~45 minutter",          // Tid brukt (valgfritt)
  "nextSteps": [...]                    // Anbefalte neste steg
}
```

## Kategorier

**agentType:**
- `quality-assurance`
- `developer`
- `designer`
- `tester`
- `documentation`
- `devops`
- `project-manager`
- `other`

**category:**
- `inspection`
- `bugfix`
- `feature`
- `refactor`
- `documentation`
- `optimization`
- `security`
- `accessibility`
- `coordination`
- `other`

**status:**
- `completed`
- `in-progress`
- `blocked`
- `cancelled`

**severity (for findings):**
- `critical`
- `medium`
- `low`

## Eksempel: Legg til ny entry

```json
{
  "id": "entry-002",
  "timestamp": "2025-01-27T12:00:00Z",
  "agent": "Developer-Agent",
  "agentType": "developer",
  "category": "bugfix",
  "title": "Fikset manglende avatar-bilder",
  "status": "completed",
  "description": "Opprettet public/avatars/ mappe og la til avatar-bilder for Elias og Journalist",
  "actions": [
    {
      "action": "create-directory",
      "result": "success",
      "details": "Opprettet public/avatars/ mappe"
    },
    {
      "action": "add-avatars",
      "result": "success",
      "details": "La til elias.png og journalist.png"
    }
  ],
  "findings": [],
  "comments": [
    {
      "id": "comment-003",
      "timestamp": "2025-01-27T12:00:00Z",
      "agent": "Developer-Agent",
      "comment": "Resolved finding-001. Avatar-bilder er nå tilgjengelige."
    }
  ],
  "filesAffected": [
    "public/avatars/elias.png",
    "public/avatars/journalist.png"
  ],
  "relatedIssues": [
    "finding-001"
  ],
  "timeSpent": "~15 minutter",
  "nextSteps": []
}
```

## Oppdater eksisterende finding

Hvis du løser en finding fra en tidligere entry, kan du oppdatere status:

```json
{
  "id": "entry-003",
  ...
  "findings": [
    {
      "id": "finding-001",
      "status": "resolved",
      "resolution": "Opprettet public/avatars/ mappe med nødvendige bilder",
      "resolvedBy": "Developer-Agent",
      "resolvedAt": "2025-01-27T12:00:00Z"
    }
  ]
}
```

## Automatisk oppdatering av lastUpdated

Når du legger til ny entry, husk å oppdatere:
```json
"lastUpdated": "2025-01-27T12:00:00Z"
```

## Best practices

1. **Inkrementer ID:** Bruk neste nummer (entry-002, entry-003, etc.)
2. **ISO 8601 timestamps:** Bruk formatet `2025-01-27T12:00:00Z`
3. **Relater til findings:** Hvis du løser noe fra en tidligere entry, referer til `findingId`
4. **Være spesifikk:** Inkluder filnavn, linjenumre, detaljerte beskrivelser
5. **Oppdater statistikk:** Oppdater `statistics`-seksjonen hvis nødvendig
6. **Valid JSON:** Sørg for at filen er gyldig JSON (bruk validator hvis usikker)

## Verktøy for å legge til entries

Du kan bruke et script, eller manuelt redigere JSON-filen. Husk å validere JSON før commit:

```bash
# Valider JSON
python -m json.tool agent-log.json > /dev/null

# Eller med Node.js
node -e "JSON.parse(require('fs').readFileSync('agent-log.json'))"
```

## Lese loggen

For å se alle åpne issues:
```bash
jq '.openIssues' agent-log.json
```

For å se alle entries fra en spesifikk agent:
```bash
jq '.entries[] | select(.agent == "QC-Engineer-Auto")' agent-log.json
```

For å se alle kritiske findings:
```bash
jq '.entries[].findings[] | select(.severity == "critical")' agent-log.json
```

## Visning i Nettsiden

Agent loggfilen vises automatisk i nettsiden når du:
1. Kopierer `agent-log.json` til `public/agent-log.json` (skjer automatisk ved build)
2. Åpner nettsiden og klikker på "Agent Log" knappen i nedre høyre hjørne

### Funksjoner i Visningen

- **Statistikk:** Oversikt over totale entries, åpne issues, kritiske funn
- **Søk:** Søk i entries etter tittel, beskrivelse eller agent-navn
- **Filtre:** Filtrer etter agent-type, kategori, eller status
- **Detaljvisning:** Klikk på en entry for å se:
  - Alle handlinger utført
  - Findings og problemer identifisert
  - Kommentarer (som commit-meldinger)
  - Neste steg
  - Berørte filer

### Agent-typer med Farger

Systemet støtter forskjellige agent-typer med egne farger:
- **quality-assurance** - Blå (QC, testing)
- **developer** - Grønn (utviklere)
- **frontend** - Lilla (UI/UX, React)
- **backend** - Oransje (API, databases)
- **devops** - Cyan (deploy, CI/CD)
- **tester** - Rosa (testing, QA)
- **designer** - Indigo (design)
- **project-manager** - Amber/Gul (prosjektledelse, koordinering)

### Status-indikatorer

- ✅ **completed** - Grønn, fullført
- 🔄 **in-progress** - Blå, pågående (med spinner)
- 🚫 **blocked** - Rød, blokkert
- ❌ **cancelled** - Grå, avbrutt

## Tips

- **Grupper arbeid:** Legg sammen relaterte endringer i samme entry
- **Referer til kode:** Inkluder filnavn og linjenumre i findings
- **Dokumenter tid:** Legg til `timeSpent` hvis relevant
- **Neste steg:** Anbefal konkrete neste steg i `nextSteps`
- **Kommentarer:** Bruk `comments` for kontekstuelle notater (fungerer som commit-meldinger)
- **Oppdater public/:** Husk å kopiere `agent-log.json` til `public/` etter oppdateringer (eller konfigurer build-script)

## Agent-spesialisering

Systemet støtter følgende agent-typer basert på deres domene:

### Frontend-agent
- **Domene:** UI/UX, React, styling
- **Eksempler:** Komponenter, animasjoner, brukeropplevelse

### Backend-agent
- **Domene:** API, databaseskjemaer, logikk
- **Eksempler:** Endpoints, database-modeller, forretningslogikk

### DevOps-agent
- **Domene:** Deploy, CI/CD, infrastruktur
- **Eksempler:** Build-prosesser, deploy-scripts, server-konfigurasjon

### Testing-agent
- **Domene:** Tester, kvalitetssikring
- **Eksempler:** Unit-tester, integration-tester, E2E-tester

### Quality-Assurance
- **Domene:** Kodekvalitet, review, standarder
- **Eksempler:** Code review, linting, kvalitetssjekk

### Project-Manager
- **Domene:** Prosjektledelse, koordinering, prioritering
- **Eksempler:** Prosjektreviews, oppgave-delegering, oppfølging, resource-planlegging

