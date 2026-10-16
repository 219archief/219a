# Code-audit — 16 oktober 2026

Alle wijzigingen zijn lokaal uitgevoerd. GitHub en de gepubliceerde websites zijn niet bijgewerkt.

## Onderzocht

De HTML-interface in `portfolio/index.html`, alle ingeladen scripts en stylesheets, hun assetverwijzingen en gedeelde projectdata; de React/Vinext/Cloudflare-integratie, contact-API, databaseschema en migratie; de scripts, dependency-lockfile, configuratie, componentimports en GitHub Pages-workflow. De framework- en serverintegratie is behouden: de bestaande website is niet naar een ander framework gemigreerd.

## Relevante bevindingen en verbeteringen

| Impact | Bestanden | Probleem en verbetering |
| --- | --- | --- |
| Hoog | `public/hover-project60.js` | Homepagefoto's hielden `is-zooming` vast nadat de zoom klaar was. Daardoor bleven drie contrastlagen elke frame rekenen. De markering wordt nu verwijderd bij voltooiing en hersteld tijdens het uitzoomen. Bij extreem lage vensters mag het beeld zo nodig verkleinen om binnen de randen te passen. |
| Hoog | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | De dependency-audit meldde 41 waarschuwingen, waaronder een kritieke Next.js-melding. Beveiligingspatches toegepast voor Next/React/RSC, Vite, ws, undici, sharp en image-size. De oorspronkelijke npm-override voor sharp werd door pnpm niet toegepast; overrides staan nu in de juiste pnpm-configuratie. Eindstand: drie meldingen, geen kritieke. Zie resterende aandachtspunten. |
| Gemiddeld | `public/image-bounds.js`, `public/logo-images52.js`, `public/menu-contrast83.js`, `public/footer-contrast74.js` | Logo, menu en footer maten dezelfde afbeeldingen telkens opnieuw, soms per tekstfragment. De foto-geometrie wordt nu eenmaal per animatieframe gedeeld. Tekstregistratie gebeurt bij relevante wijzigingen. De bestaande maskers en zichtbare effecten blijven behouden. |
| Gemiddeld | `scripts/site-assets.mjs`, `scripts/build-pages.mjs`, `public/`, `components/`, `package.json` | Oude frontendversies, ongebruikte UI-scaffolding en originele JPEG-bronbestanden werden meegekopieerd naar Pages. De build volgt nu de actieve HTML/CSS/JS-verwijzingen en voegt de 42 data-gedreven WebP-varianten toe. 118 ongebruikte/verouderde code- en configuratiebestanden en 22 directe dependencies verwijderd. Originele foto's zijn bewaard in de bronmap. |
| Gemiddeld | `public/color-transition68.js` | Naar het archief navigeren tijdens een lopende kleurovergang sloeg de annulering over. Een oude overgang kon daarna alsnog naar het project navigeren. Lopende overgangen worden nu eerst opgeruimd, inclusief overlay, preview en voorbereidingsklassen. |
| Gemiddeld | `app/api/contact/route.ts` | Een mislukte database-update van de e-mailstatus gaf een foutmelding terwijl het bericht al opgeslagen was. Die optionele statusupdate kan nu de ontvangstbevestiging niet meer ongedaan maken. Ongetypeerde invoer vervangen door `Record<string, unknown>`. |
| Laag | `public/app.js`, `public/static-home130.js`, `public/viewer-transition71.js` | Eerste foto's met eager-loading behoorden juist tot het verborgen project. Nu krijgt de eerste zichtbare homepagefoto prioriteit. Dubbele layoutaanroepen, ongebruikte variabelen, een lege callback en de overbodige uitgaande fotokloon in de fullscreenviewer verwijderd. |
| Laag | `types/assets.d.ts`, `tests/`, `eslint.config.mjs`, `.gitignore` | Typecheck faalde op de geldige Vite-HTML-import. De vier oude tests controleerden verouderde dist-bestanden en oude ontwerpkeuzes. Typeverklaring toegevoegd, tests vervangen door actuele regressietests en gegenereerde uitvoer uitgesloten van linting/Git. De Pages-build is nu herhaalbaar; alleen de gecontroleerde `_site`-uitvoermap kan automatisch worden vervangen. |

## Meetresultaten

Dezelfde headless Edge-versie, viewport van 1440 × 1000, één seconde meten bij een stilgehouden homepagehover nadat de zoom klaar was:

| Meting | Voor | Na |
| --- | ---: | ---: |
| `getComputedStyle`-aanroepen | 39.875 | 425 |
| `getBoundingClientRect`-aanroepen | 8.555 | 102 |
| Aanroepen in rust / na uitzoomen | 0 | 0 |
| Statische Pages-uitvoer | 38.561.857 bytes | 5.276.392 bytes |

Ongeveer 99% minder stijl-/positiemetingen bij vasthouden van de hover. Het publicatiepakket is 86,3% kleiner. Dit laatste is geen meting van pagina-laadtijd: ongebruikte bestanden werden voorheen meestal niet door de browser opgevraagd, maar stonden wel in het publicatiepakket.

## Verwijderde code

- 45 niet-ingeladen historische frontendbestanden, waaronder `living-home88.js`, oude kleur-/hover-/logo-implementaties en duplicaten van de basisstylesheet. Geen ongebruikte `.js`/`.css`-bestanden in de publieke root over volgens de actieve assetgrafiek.
- 61 ongebruikte UI-componenten, de ongebruikte `components/connector-error.tsx`, `hooks/use-mobile.ts`, `lib/utils.ts`, een niet-geïmporteerde stylesheet en bijbehorende Tailwind/shadcn-configuratie en vendorthema.
- Vier verouderde root-tests, vervangen door twee testbestanden met negen gedragsgerichte tests.
- 19 UI-dependencies en drie stylingdependencies. Framework-, database- en publicatie-afhankelijkheden zijn behouden.

## Uitgevoerde controles

- `pnpm test`: 9/9 geslaagd. Projectrelaties, sorteervolgorde, homepage-selectie, alle WebP-varianten, 176 layoutbreedtes, zoomgrenzen inclusief lage vensters, assetgrafiek, herhaalbare Pages-build en contact-API-validatie/idempotentie/foutafhandeling.
- `pnpm lint`: geslaagd, zonder meldingen.
- `pnpm typecheck`: geslaagd.
- Frameworkbuild via de bestaande Sites-helper: geslaagd, inclusief `/api/contact`.
- Pages-build: geslaagd, 87 actieve assets plus index en `.nojekyll`.
- Browsercontroles op 1440, 390 en 320 pixels: navigatie, sorteervolgorde, kleurproject, fullscreen openen/doorklikken/sluiten, onderbroken overgang naar info en herhaald wisselen tussen pagina's. Geen browserfouten, ontbrekende requests of horizontale overflow. Het aantal contrastlagen bleef gelijk: geen groei in de geteste navigatiecycli.
- Gerichte scan op veelvoorkomende token-/private-keypatronen in de broncode: geen treffers. Dit is geen garantie dat iedere mogelijke vorm van geheimdetectie is afgedekt.

## Resterende aandachtspunten

1. **Hoog — ontwikkeltooling:** `braces` heeft nog een high-severity melding voor denial-of-service bij diep geneste, onbetrouwbare globpatronen. De registry meldt geen gepatchte versie. Het komt binnen via ESLint/Vinext-buildplugins; het is geen publiek contact-API-endpoint. Geen ongeteste vervanging van een transitieve globparser geforceerd. [Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
2. **Gemiddeld/laag — ontwikkeltooling:** twee esbuild-meldingen blijven via Drizzle Kit en Wrangler bestaan. De beschreven aanvallen richten zich op ontwikkelservers; deze site gebruikt geen esbuild-serve-endpoint in productie. De transitie naar een nieuwere esbuild-minor of nieuwe parent-tooling moet samen met het database-/previewpad worden getest. [Ontwikkelserveradvisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99), [Windows-advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr).
3. ESLint 9 en twee transitieve esbuild-kit-pakketten zijn als verouderd gemeld. Een majorupgrade is niet nodig om deze auditwijzigingen te laten werken en is niet ongecontroleerd meegenomen.
4. Het contactformulier op GitHub Pages heeft nog steeds geen backend. De originele Sites-versie behoudt de API. De API-tests gebruiken een database-/mailmock: er zijn geen echte e-mails verstuurd en productiegegevens zijn niet gewijzigd.
5. De contrastmaskers blijven bewust een relatief complexe functie. Hun gedeelde metingen zijn geoptimaliseerd; een volledige herschrijving zou extra visueel regressierisico toevoegen. De prototype-instelling die reduced-motion bij de kleurovergang negeert is behouden; vóór een definitieve publieke release is respecteren van die voorkeur aan te raden.

De kritieke Next.js-advisory betrof `next/og` met onbetrouwbare SVG-invoer; zo'n route is niet aangetroffen. De patch is wel toegepast. De GitHub Pages-build installeert of draait deze serverpakketten niet. [Next.js-advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), [pnpm-configuratie](https://pnpm.io/settings#overrides).
