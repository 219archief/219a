# 219 — bobby’s foto archief

Een fotografieportfolio met een vrije archiefcompositie, projectpagina’s, fullscreenweergave en een afzonderlijke Info & Contact-pagina.

## Bronnen
- `portfolio/index.html`: de bestaande HTML-interface.
- `public/`: CSS, JavaScript, fonts en fotografie-assets.
- `app/route.ts`: serveert de interface.
- `app/api/contact/route.ts`: valideert en bewaart contactberichten.
- `db/schema.ts` en `drizzle/`: databaseschema en migraties.

De frontend blijft gewone HTML/CSS/JavaScript. De Sites/Vinext-runtime verzorgt alleen het servergedeelte en het publiceren van assets. De uitvoer in `dist/` wordt gegenereerd.

## Lokaal
Node >=22.13 en pnpm 11.25.0 zijn vereist. Installeer met de Sites-helper `install-dependencies.mjs`. Start daarna `pnpm dev`; gebruik de getoonde loopback-URL. Een gebouwde versie start met `pnpm start`. Voor lokale D1-opslag moet de migratie eerst eenmaal worden toegepast; zie de Sites-starterdocumentatie.

## Contact
Berichten worden opgeslagen in de Sites-database. E-mailmeldingen zijn optioneel en nog niet geconfigureerd. Zie CONTACT_SETUP.md voor de drie servervariabelen en het bekijken van berichten. Er staat geen fictief contactadres op de site.

## Publiceren
Behoud project_id en het publiek in `.openai/hosting.json`. Gebruik de Sites-bronworkflow, bouw met `build-site.mjs` en publiceer de exacte gepushte bronversie. Productiemigraties worden daarbij toegepast.
