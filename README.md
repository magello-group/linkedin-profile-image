# LinkedIn Profilbilds- och Inläggsgenerator

En webbapplikation som låter dig skapa professionella LinkedIn-bilder och inlägg med anpassad text och effekter. Perfekt för att skapa profilbilder, lägga till badge eller generera nyanställd-inlägg.

## Funktioner

- Tre verktyg i ett:
  - **Profilbild**: Ladda upp, beskära och gör din bild svartvit med rosa skimmer. Ingen text eller badge.
  - **Badge på profilbild**: Ladda upp bild, lägg till valfri text (eller välj bland förslag), positionera texten och ladda ner med badge.
  - **LinkedIn - Nyanställd nyhetsbild**: Ladda upp valfri bild, lägg till namn/text, skala och flytta både bild och text, och ladda ner en färdig bild för LinkedIn-inlägg.
- Justera textstorlek, position och färg där det är tillämpligt
- Realtidsförhandsvisning av resultatet
- Ladda ner den genererade bilden (med ikon på knappen)
- Drag & drop-positionering av bild och/eller text
- Responsiv och modern design
- Ingen bilddata laddas upp till någon server – allt sker lokalt i din webbläsare

## Kom igång

### Förutsättningar

- Node.js (version 14 eller högre)
- npm eller yarn

### Installation

1. Klona repositoryt:
```bash
git clone [repository-url]
cd linkedin-profile-image
```

2. Installera beroenden:
```bash
npm install
# eller
yarn install
```

3. Starta utvecklingsservern:
```bash
npm run dev
# eller
yarn dev
```

Applikationen öppnas i din standardwebbläsare på `http://localhost:5173` (eller enligt Vite-konfiguration).

## Användning

1. Starta appen och välj ett av verktygen på startsidan:
   - **Profilbild**: `/profile`
   - **Badge på profilbild**: `/badge`
   - **LinkedIn - Nyanställd nyhetsbild**: `/new-employee`
2. Följ instruktionerna för respektive verktyg:
   - Ladda upp bild
   - Lägg till och justera text (om tillämpligt)
   - Skala och flytta bild/text
   - Förhandsgranska och ladda ner din bild

## Deployment

Applikationen är konfigurerad för automatisk deployment till Azure Static Web Apps. Varje push till main-branchen triggar en ny deployment.

### Deployment Process

1. Skapa en Azure Static Web App i Azure Portal
2. Lägg till följande hemlighet i GitHub repository:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Din Azure Static Web Apps API-token
3. Pusha till main-branchen för att trigga deployment

## Använda teknologier

- React
- TypeScript
- HTML5 Canvas
- CSS3
- Azure Static Web Apps
- GitHub Actions
- Vite

## Licens

Detta projekt är licensierat under MIT-licensen - se LICENSE-filen för detaljer.

## Bidra

Bidrag är välkomna! Tveka inte att skicka in en Pull Request.
