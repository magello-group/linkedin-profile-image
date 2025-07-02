# LinkedIn Profilbildsgenerator

En webbapplikation som låter dig skapa professionella LinkedIn-profilbilder med anpassad text. Perfekt för att skapa profilbilder med ditt namn eller företagsinformation.

## Funktioner

- Ladda upp din egen profilbild
- Lägg till anpassad text
- Välj bland standardtexter (t.ex. "Anställer!", "Tillgänglig!", "Fullstack", "Konsult")
- Justera textstorleken med ett reglage
- Realtidsförhandsvisning av resultatet
- Ladda ner den genererade bilden (med ikon på knappen)
- Hover-effekter på formulärfält för bättre användarupplevelse
- Responsiv design
- Modernt och rent användargränssnitt

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
npm start
# eller
yarn start
```

Applikationen öppnas i din standardwebbläsare på `http://localhost:3000`.

## Användning

1. Klicka på "Välj fil" för att ladda upp din profilbild
2. Ange den text du vill ha överlagrad på din bild, eller välj en av standardtexterna genom att klicka på någon av förslagsknapparna
3. Justera textstorleken med reglaget om du vill
4. Förhandsgranska resultatet i realtid
5. Klicka på "Ladda ner bild" (med nedladdningsikon) för att spara din genererade bild

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

## Licens

Detta projekt är licensierat under MIT-licensen - se LICENSE-filen för detaljer.

## Bidra

Bidrag är välkomna! Tveka inte att skicka in en Pull Request.
