# Reservatieflow — Vigilis Law Consult

## Overzicht

```
Klant opent /reservatie
        │
        ▼
[1] Token check
        │ geen geldig token → toegang geweigerd
        ▼
[2] Kalender — datum kiezen
        │
        ▼
[3] Formulier — tijdslot + gegevens invullen
        │
        ▼
[4] POST /api/reservations
        │ validatie mislukt → foutmelding aan klant
        │ tijdslot bezet   → foutmelding aan klant
        ▼
[5] Reservatie aangemaakt met status PENDING
        │
        ├──▶ E-mail naar klant (bevestiging ontvangst)
        └──▶ E-mail naar admin (nieuwe aanvraag)
                │
                ▼
[6] Admin beoordeelt aanvraag (/admin/reservations)
        │
        ├──▶ ACCEPTED → e-mail naar klant (goedgekeurd)
        ├──▶ REJECTED → e-mail naar klant (geweigerd)
        └──▶ CANCELED → e-mail naar klant (geannuleerd)
```

---

## Stap 1 — Token check

De pagina `/reservatie` is niet publiek toegankelijk. De klant heeft een geldig **toegangstoken** nodig om het formulier te kunnen gebruiken.

- Tokens worden aangemaakt via het admin-paneel (`/admin/tokens`)
- Een token kan een optionele vervaldatum hebben
- Zonder geldig token wordt de klant doorverwezen

---

## Stap 2 — Datum kiezen (kalender)

- De kalender toont de huidige maand
- **Vandaag en verleden datums** zijn uitgeschakeld — reservaties moeten minstens morgen zijn
- **Volledig geblokkeerde dagen** (startTime 00:00, endTime 23:59) worden grijs weergegeven en zijn niet klikbaar
- Per maandwissel haalt de kalender via `GET /api/reservations?month=YYYY-MM` de geblokkeerde slots op

---

## Stap 3 — Tijdslot en gegevens invullen

Na het kiezen van een datum schuift de klant naar het formulier.

**Vereiste velden:**
| Veld | Validatie |
|---|---|
| Naam | min. 2 tekens |
| E-mailadres | geldig e-mailformaat |
| Starttijd | verplicht, uit beschikbare slots |
| Eindtijd | verplicht, na starttijd |
| Beschrijving | min. 5 tekens |

- De beschikbare tijdsloten worden live gefilterd op basis van reeds goedgekeurde/openstaande reservaties én geblokkeerde slots voor die dag
- Als het gewenste tijdstip niet in de lijst staat, kan de klant dit vermelden in het beschrijvingsveld

---

## Stap 4 — Servervalidatie (`POST /api/reservations`)

De API voert de volgende controles uit **vóór** aanmaken:

1. **Schema-validatie** (Zod) — alle velden correct ingevuld
2. **Tijdslot-logica** — eindtijd moet na starttijd liggen
3. **Datum in de toekomst** — datum mag niet vandaag of vroeger zijn
4. **Dubbele boekingen** — controle op overlappende PENDING of ACCEPTED reservaties
5. **Geblokkeerde slots** — controle of het tijdslot niet valt binnen een beheerdersblok

Bij een conflict geeft de API een `409 Conflict` terug.

---

## Stap 5 — Reservatie aangemaakt (status: PENDING)

Bij succes wordt de reservatie opgeslagen in de database met status `PENDING`.

Er worden meteen **twee e-mails** verstuurd:

**Naar de klant:**
> Bevestiging van uw reservatie-aanvraag — u krijgt bericht zodra de aanvraag is goedgekeurd of geweigerd.

**Naar de admin** (via `ADMIN_NOTIFICATION_EMAIL` in `.env`):
> Nieuwe reservatie-aanvraag met naam, e-mail, datum, tijd en beschrijving.

---

## Stap 6 — Admin beoordeelt de aanvraag

In het admin-paneel (`/admin/reservations`) kan de beheerder elke aanvraag:

| Actie | Nieuwe status | E-mail naar klant |
|---|---|---|
| Goedkeuren | `ACCEPTED` | Ja — afspraak bevestigd |
| Weigeren | `REJECTED` | Ja — aanvraag geweigerd |
| Annuleren | `CANCELED` | Ja — afspraak geannuleerd |

Alle statuswijzigingen worden gelogd in het activiteitslog (`/admin/audit`).

---

## Statusoverzicht

| Status | Betekenis |
|---|---|
| `PENDING` | Aanvraag ingediend, wacht op beoordeling |
| `ACCEPTED` | Goedgekeurd door admin |
| `REJECTED` | Geweigerd door admin |
| `CANCELED` | Geannuleerd (na goedkeuring) |
