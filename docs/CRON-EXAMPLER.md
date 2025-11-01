# Cron-schedule Eksempler

## Standard Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Dag i uken (0-7, hvor 0 og 7 = søndag)
│ │ │ └───── Måned (1-12)
│ │ └─────── Dag i måneden (1-31)
│ └───────── Time (0-23)
└─────────── Minutt (0-59)
```

## Ofte Brukte Eksempler

### Hver Time
```yaml
- cron: '0 * * * *'  # Top of every hour
- cron: '30 * * * *' # Hver time klokka :30
```

### Hver 6. Time
```yaml
- cron: '0 */6 * * *'  # Klokka 00:00, 06:00, 12:00, 18:00
- cron: '0 0,6,12,18 * * *'  # Samme som over
```

### Daglig
```yaml
- cron: '0 0 * * *'  # Hver dag klokka midnatt
- cron: '0 9 * * *'  # Hver dag klokka 09:00
```

### Hverdager (Mandag-Fredag)
```yaml
- cron: '0 9 * * 1-5'  # Hver hverdag klokka 09:00
- cron: '0 9 * * MON-FRI'  # Samme (GitHub støtter begge)
```

### Ukentlig
```yaml
- cron: '0 0 * * 0'  # Hver søndag klokka midnatt
- cron: '0 9 * * 1'  # Hver mandag klokka 09:00
```

### Hvert 15. Minutt
```yaml
- cron: '*/15 * * * *'  # 00, 15, 30, 45 minutter hver time
```

### Annenhver Time
```yaml
- cron: '0 */2 * * *'  # Klokka 00:00, 02:00, 04:00, osv.
```

### Spesifikke Dager i Måneden
```yaml
- cron: '0 0 1,15 * *'  # 1. og 15. hver måned klokka midnatt
```

### I Februar
```yaml
- cron: '0 9 * 2 *'  # Hver dag i februar klokka 09:00
```

## GitHub Actions Spesifikke Ting

### ⚠️ Viktig
- Cron kjøres i **UTC tid**, ikke lokal tid
- Norsk tid er UTC+1 (vinter) eller UTC+2 (sommer)
- For å kjøre klokka 09:00 norsk tid vinter, bruk `'0 8 * * *'` (UTC)
- For sommer, bruk `'0 7 * * *'` (UTC)

### Eksempel: Norsk Klokkeslett
```yaml
# Kjøre 09:00 norsk tid vinter (08:00 UTC)
- cron: '0 8 * * *'  

# Kjøre 09:00 norsk tid sommer (07:00 UTC)  
- cron: '0 7 * * *'  

# Kjøre 12:00 norsk tid vinter (11:00 UTC)
- cron: '0 11 * * *'

# Kjøre 17:00 norsk tid vinter (16:00 UTC)
- cron: '0 16 * * *'
```

## Anbefalte Intervaller for PM-Check

| Situasjon | Anbefalt Schedule |
|-----------|-------------------|
| Aktivt utvikling | `'0 */2 * * *'` - Hver 2. time |
| Stabil produksjon | `'0 9 * * 1-5'` - Hverdager 09:00 |
| Testing/QA fase | `'*/30 * * * *'` - Hvert 30. minutt |
| Critical bugs | `'*/15 * * * *'` - Hvert 15. minutt |
| Standard prosjekt | `'0 * * * *'` - Hver time |

## Norsk Tidzone Converter

For å konvertere norsk tid til UTC:
- **Vinter (CET)**: Trekk fra 1 time
- **Sommer (CEST)**: Trekk fra 2 timer

**Eksempel:**
- Norsk 09:00 (vinter) = `'0 8 * * *'` (UTC)
- Norsk 09:00 (sommer) = `'0 7 * * *'` (UTC)

## Testing

Test at cronen fungerer:
1. Gå til "Actions" i GitHub repo
2. Se på "Project Manager Check" workflow
3. Sjekk "Runs" tab for siste kjøring
4. Du kan også trigge manuelt med "Run workflow" knapp

## Endre Vår Cron

Rediger `.github/workflows/pm-check.yml` linje 6:

```yaml
- cron: '0 * * * *'  # <-- Endre denne linjen
```

Committ og push, så kjøres det automatisk!

