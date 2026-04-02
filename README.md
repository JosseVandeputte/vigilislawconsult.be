# Vigilis Law Consult - Website 
*Version: 2.0* <br>
*Licence: (coming soon)*

## Project Overzicht

Professionele website voor Vigilis Law Consult met beveiligde reservatiesysteem.

## 📋 Inhoudsopgave

1. [Functionaliteiten](#functionaliteiten)
2. [Publieke Pagina's](#publieke-paginas)
3. [Reservatiesysteem](#reservatiesysteem)
4. [Beheeromgeving (Admin)](#beheeromgeving-admin)
5. [Technische Stack](#technische-stack)
6. [Deployment](#deployment)

---

## 🚀 Functionaliteiten

De website bevat twee grote onderdelen:

### Publieke Website
- Informatieve homepagina over Vigilis Law Consult
- Secties met zakelijke informatie
- Privacy- en cookiebeleidspagina
- Custom 404 pagina bij foutieve links
- Responsive design voor mobiel/tablet/desktop (coming soon)

### Beveiligde Reservatiesysteem
- Tokengebaseerde toegang tot reservatiepagina
- Interactieve kalender voor beschikbaarheid
- Formulier voor reservatieaanvragen
- Geautomatiseerde email notificaties bij maken/wijzigen van afspraak

### Beheeromgeving
- Admin login met tokenverificatie
- Kalendariumoverzicht van reservaties
- Reservatiebeheersysteem met statusupdates
- Blokkadebeheersing voor tijdsloten
- Tokenbeheersing voor klanten
- Activiteitslog voor transparantie

---

## 🏠 Publieke Pagina's

### Homepagina
- **Welcome sectie**: Inleiding en kernboodschap
- **Wie ben ik**: Over de beheerder
- **Ons aanbod**: Diensten en specialisaties
- **Wat kost het**: Prijsinformatie
- **Nuttige links & info**: Aanvullende informatie

### Privacy Pagina
- Privacyverklaring
- Cookiepolicy
- GDPR informatie

### 404 Pagina
- Custom not-found pagina
- Navigatielinks naar homepage

---

## 📅 Reservatiesysteem

### Voor Klanten

#### Stap 1: Tokenvalidatie
- Klant voert e-mailadres en persoonlijke code (token) in
- Systeem valideert beide tegen database
- Tokens kunnen beperkte geldigheid hebben

#### Stap 2: Datum kiezen
- Interactieve kalender
- Vandaag en verleden datums zijn niet boekbaar
- Volledige geblokkeerde dagen zijn niet selecteerbaar
- Maandnavigatie met "vandaag" knop

#### Stap 3: Formulier
- Naam
- E-mailadres (voorgevuld uit sessie)
- Starttijd
- Eindtijd
- Beschrijving van gewenste afspraak

#### Stap 4: Bevestiging
- Validatie van alle velden
- Controle op duplicaten reserveringen en conflicten
- Email notificatie naar klant en beheerder
- Duidelijke foutmeldingen bij problemen

---

## 🔧 Beheeromgeving (Admin)

### Admin Login
- Tokengebaseerde authenticatie
- Beveiligde sessie via HttpOnly cookies

### Kalender Module
- Week- en maandweergave
- Kleurcodes per reservatiestatus
- Click-to-details op reservaties
- Snelle status updates (accepteren/weigeren/annuleren)

### Reservaties Module
- Lijstweergave van alle reservaties
- Filtering op status (pending/accepted/rejected/canceled)
- Bulk-acties op reservaties
- Verwijderoptie

### Geblokkeerde Slots Module
- Blokkade van specifieke tijdsloten
- Volledige dagblokkade
- Optionele beschrijving van reden
- 15-minuten granulariteit
- Aankomende en verleden blokkades apart

### Tokens Module
- Aanmaken van klanttokens
- Tokens gekoppeld aan e-mailadres
- Vervaldatum instellen (optioneel)
- Tokenwaarde tonen (voor communicatie naar klant)
- Verwijdering van tokens

### Activiteitslog Module
- Alle acties getraceerd (aanmaak, wijzigen, verwijderen)
- Paginatie (10/20/50/100)
- Uitklapbare details per actie
- Timestamps en user informatie

---

## 🛠️ Technische Stack

### Frontend
- **Framework**: Next.js 15.5 met TypeScript
- **Styling**: CSS Modules + PostCSS
- **Kalender**: FullCalendar (met week/maand views)
- **Client-side**: React 19

### Backend
- **API**: Externe Deno API ([SwaggerHub](https://vlc-server-feb-2026.deno.dev))
- **Authenticatie**: Cookie-gebaseerde sessies
- **Transport**: HTTP/2 via CORS

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop) (coming soon)

---

## 📋 Reservatiestatussen

| Status | Betekenis |
|--------|-----------|
| PENDING | Aanvraag ontvangen, wacht op beoordeling |
| ACCEPTED | Goedgekeurd door beheerder |
| REJECTED | Geweigerd door beheerder |
| CANCELED | Geannuleerd na goedkeuring |

---

## 🚀 Deployment

### Lokaal Development
# vigilislawconsult.be
https://vigilislawconsult.be

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```
Server draait op `http://localhost:3000`

### Build commando
```bash
npm run build
```
Genereert `out/` folder met statische bestanden.

### Upload naar FTP
1. Upload alles in `out/` naar je host
2. Zorg dat `.htaccess` meegeupload wordt
3. Test custom 404 door foutieve URL in te voeren
4. Controleer verbinding naar backend API

### Omgeving
- `NEXT_PUBLIC_API_URL` bepaalt API host
- `STATIC_EXPORT=true` triggert static export build


---

## 🔒 Beveiliging

- Cookie-gebaseerde sessies met HttpOnly flag
- Token-based toegang tot reservaties
- Server-side validatie van alle inputs
- CORS configuratie voor cross-origin requests
- Audit trail van alle acties
- Automatische timeout van sessies

---

## 📞 Contact & Support

**Developer**
- **Naam**: Josse Vandeputte
- **Email**: info@vdpj.be

**Bedrijf**
- **Naam**: Filip Scheemaker
- **Email**: info@vigilislawconsult.be

Voor meer informatie zie footer op website voor extra contactgegevens.

---

*Geüpdate: 30/03/2026*