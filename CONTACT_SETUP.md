# Contactformulier

De Info-pagina is een eigen hashroute: #info. Het formulier verzendt naar POST /api/contact. Berichten worden duurzaam opgeslagen in Sites D1, tabel contact_messages. Alleen na bevestigde opslag verschijnt “je bericht is ontvangen”. Er is geen openbaar endpoint om berichten te lezen. De eigenaar kan de berichten via de Sites-databasetools opvragen.

## E-mail later activeren
Stel via Sites runtime-omgevingsvariabelen in (nooit in frontend of Git):
- CONTACT_TO: je echte ontvangstadres
- CONTACT_FROM: een bij Resend geverifieerd afzenderadres
- RESEND_API_KEY: geheime Resend API-sleutel
Publiceer opnieuw om de configuratie toe te passen. Zonder deze drie waarden werkt opslag wel en zijn e-mailmeldingen uit. Eerdere berichten worden niet automatisch gemaild. De kolom notification bevat disabled, pending, sent of failed.

## Bescherming
Servervalidatie, maximale requestgrootte, same-origincontrole, honeypot, maximaal vijf berichten per uur per dagelijks gehashte client en idempotente request-ID. Geen ruwe IP-adressen opgeslagen. Geen berichten of sleutels in logs. De bestaande private site-toegang is behouden.

## Bronstructuur
portfolio/index.html: bestaande HTML-interface; public/: bestaande CSS, JS en foto's; app/route.ts: HTML-response; app/api/contact/route.ts: contact-API. Sites/Vinext bouwt de Worker en statische assets. De fotografie-interface is niet naar React herschreven.
