# Projectkleuren en coverovergang

De bestaande projectdata in dist/projects.js is de enige bron voor de instellingen:
- id: bestaande projectslug; links blijven #/project/{id}.
- backgroundEnabled: true geeft dit project een aangepaste achtergrond.
- backgroundColor: geldige hexkleur, bijvoorbeeld #B8CDF8.
- transitionEnabled: true activeert de vloeiende achtergrondfade.
- backgroundCoverPhotoId: optioneel bestaande foto-ID die een rand krijgt. Zonder dit veld krijgen alle homepagebeelden van het ingeschakelde project een rand.

Een ontmoeting (foto-07) hoort bij ontmoetingen. Ontmoetingen gebruikt #846C5B. Kustlijn (foto-05) hoort bij langs-de-kust en gebruikt #B8CDF8. Er zijn geen dubbele projecten aangemaakt. Binnen en buiten is uitgeschakeld en behoudt #faf9f6.

projectAppearance normaliseert de instellingen. theme.js past de kleur al in de head toe, ook bij rechtstreeks openen. app.js geeft alleen de ingestelde covers een buitenrand van 1,5% van de beeldbreedte: CSS-containerunits met een berekende fallback. Het beeld wordt niet kleiner.

project-transition41.js breidt de kleur in 6 seconden met een gelijkmatig tempo en zachte rand vanuit de actuele fotorand uit tot het scherm gevuld is. Een tijdelijke kopie houdt de aangeklikte foto zichtbaar. De normale router opent daarna het project; de achtergrond wordt onder het volledig dekkende kleurvlak op exact de projectkleur gezet. Na twee renderframes wordt de inhoud in 1000 ms onthuld. Directe projectlinks krijgen hun kleur vóór de eerste paint. Reduced motion gebruikt een kleurfade van 900 ms zonder uitbreiding.

Teruggaan gebruikt de bestaande achtergrondfade naar de homepagekleur. Er is bewust geen omgekeerde beeldanimatie: ook browser-terug, andere secties en rechtstreeks geopende projecten moeten betrouwbaar blijven werken.

Een toekomstig CMS levert dezelfde velden bij de bestaande projectrecords. Animatie en rendering hoeven daarvoor niet herschreven te worden. Er is geen CMS, database of dependency toegevoegd.




Logo: logo-images39.js berekent uitsluitend de overlap met zichtbare fotografie. Een zwart basismasker geldt op de pagina-achtergrond; een apart, tot beeldpixels geknipt logomasker gebruikt het bestaande zwart-witnegatief. De vaste positie en scrollschaal blijven behouden.


Alle homepagefoto’s van een project met backgroundEnabled en transitionEnabled starten dezelfde uitvloeiing. backgroundCoverPhotoId bepaalt uitsluitend welke foto een rand krijgt en beperkt de overgang niet.


project-reveal41.js houdt de projectgalerij onzichtbaar totdat de kleurtransitie en eventuele overlay afgerond zijn. Daarna wacht het op het decoderen van de eerste zichtbare foto's en toont het de galerij met een opacity-fade van 1600 ms (250 ms bij minder beweging). Dit werkt via homepagefoto's, projectnavigatie, geschiedenis en directe projectlinks. Een nieuwe navigatie annuleert de vorige onthulling.

