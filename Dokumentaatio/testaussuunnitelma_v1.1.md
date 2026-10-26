# Testaussuunnitelma: Pedagoginen sanapilvisovellus

**Versio:** 1.1
**Päivämäärä:** 20.10.2026
**Testattava versio:** paikallinen Next.js-kehitysympäristö, localhost:3000

## 1. Tarkoitus ja rajaus

Sanapilvi on anonyymi, reaaliaikainen pedagoginen työkalu. Esittäjä luo session, jonka osallistumisosoite esitetään QR-koodina, ja osallistujat lähettävät sanoja. Esittäjän näkymä näyttää sanojen lukumäärät sanapilvenä.

Tämä suunnitelma koskee ensin nykyistä MVP:tä:

- session luonti aloitussivulta
- esittäjän sessionäkymä
- osallistumisosoite ja QR-koodi
- sanan lähettäminen osallistujanäkymästä
- Supabase-tallennus ja Realtime-päivitys
- sanojen laskenta ja D3-sanapilven visualisointi

Ryhmänjako, äänestys, fiilismittari, useat työkalut, admin-roolit, kirjautuminen, moderointi, blur/paljastus ja CAPTCHA ovat tässä vaiheessa ehdotuksia. Niille määritellään myöhemmin omat hyväksymiskriteerit luvussa 11; niitä ei hyväksytä MVP:n perusteella toteutetuiksi.

## 2. Testauksen tavoitteet

Testauksen tavoitteena on varmistaa, että:

- käyttäjä voi luoda session ja osallistua siihen ilman kirjautumista
- syötteen rajat ja virhetilanteet käsitellään ymmärrettävästi
- vain oikean session sanat näkyvät kyseisen session pilvessä
- sanapilvi päivittyy reaaliaikaisesti ja laskee toistot oikein
- QR-koodi sisältää osallistumisosoitteen `/join/<joinCode>` ja johtaa osallistumisnäkymään
- käyttö toimii sovituilla selaimilla, mobiilissa ja näppäimistöllä
- anonyymi käyttö ei paljasta tarpeettomia henkilötietoja
- Supabase RLS, session-eristys ja käyttörajat ovat erikseen suunniteltuja tarkistuksia; niitä ei ole tässä testituloksessa toteutettuina testeinä
- toteutuneet automaattiset testit, pending-testit ja avoin testivelka on eroteltu

## 3. Testattava toiminnallisuus

### 3.1 Session luonti ja esittäjän näkymä

| ID     | Testi                                                      | Odotettu tulos                                                        | Prioriteetti |
| ------ | ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------ |
| MVP-01 | Avaa aloitussivu toimivilla Supabase-asetuksilla           | Luontipainike näkyy ja on käytettävissä                               | P0           |
| MVP-02 | Luo uusi sanapilvi                                         | Uusi session syntyy ja käyttäjä siirtyy `/host/[sessionId]`-näkymään | P0           |
| MVP-03 | Luo useita sessioita peräkkäin                             | Jokaisella on yksilöllinen tunniste ja omat sanat                     | P1           |
| MVP-04 | Avaa aloitussivu ilman Supabase-asetuksia                  | Käyttäjälle näytetään ymmärrettävä ohje; luonti ei käynnisty          | P1           |
| MVP-05 | Avaa esittäjän näkymä `/host/[sessionId]`-reitillä         | Host-sivu hakee session host_token-evästeen perusteella               | P0           |
| MVP-06 | Tarkista QR-koodi                                           | QR-koodi sisältää osallistumisosoitteen `/join/[joinCode]`            | P0           |
| MVP-07 | Tarkista tekstimuotoinen osallistumislinkki ja kopiointi    | TARKISTETTAVA: nykyisessä UI:ssa ei ole näkyvää tekstilinkkiä tai kopiointitoimintoa | P1 |

### 3.2 Osallistujan sanan lähettäminen

| ID     | Testi                                                           | Odotettu tulos                                                                                    | Prioriteetti |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| MVP-08 | Lähetä tavallinen sana                                          | Sana tallennetaan ja onnistumisilmoitus näytetään                                                 | P0           |
| MVP-09 | Lähetä sana pienillä kirjaimilla ja ympäröivillä välilyönneillä | Submission lähetetään trimmattuna; host normalisoi sanan visualisointia varten trim- ja lowercase-logiikalla | P0 |
| MVP-10 | Lähetä tyhjä tai vain välilyöntejä sisältävä arvo               | Lähetys estyy eikä tyhjää riviä tallenneta                                                        | P0           |
| MVP-11 | Syötä 25 merkkiä                                                | Syöte voidaan hyväksyä                                                                            | P1           |
| MVP-12 | Ylitä 25 merkin raja tai ohita selainrajoite pyynnöllä          | TARKISTETTAVA: käyttöliittymä rajoittaa 25 merkkiin; API-tason pituusrajan käyttäytymistä ei ole tässä testikokonaisuudessa varmistettu | P0 |
| MVP-13 | Lähetä erikoismerkkejä, ääkkösiä, emoji ja useita sanoja        | Sovittu tekstisisältö säilyy turvallisesti; käyttöliittymä ei suorita sisältöä                    | P1           |
| MVP-14 | Paina lähetystä nopeasti useita kertoja                         | Lähetyksen aikainen esto estää tahattoman tuplalähetyksen; palvelinrajoitukset testataan erikseen | P1           |
| MVP-15 | Lähetä sana virheellisellä participant ID:llä                    | Käyttäjälle näytetään epäonnistuminen eikä vastausta tallenneta                                   | P0           |

### 3.3 Realtime-sanapilvi

| ID     | Testi                                                   | Odotettu tulos                                                                                    | Prioriteetti |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| MVP-16 | Lähetä sana osallistujanäkymästä esittäjän ollessa auki | Sana ilmestyy pilveen ilman sivun virkistystä                                                     | P0           |
| MVP-17 | Lähetä sama sana useita kertoja                         | Sanaa käsitellään yhtenä visualisointikohteena ja sen koko perustuu esiintymiin                   | P0           |
| MVP-18 | Lataa sessionäkymä, jossa sanoja on jo tallennettu      | Alkudata haetaan ja visualisoidaan oikein                                                         | P0           |
| MVP-19 | Avaa kaksi eri sessionäkymää                            | Toisen session sanat eivät näy toisessa                                                           | P0           |
| MVP-20 | Muuta ikkunan tai näkymän kokoa                         | Pilvi asettuu uudelleen eikä sisältö leikkaudu kohtuuttomasti                                     | P1           |
| MVP-21 | Sulje sessionäkymä tai navigoi pois                     | Realtime-tilaus poistuu eikä vanha näkymä saa päivityksiä                                         | P1           |
| MVP-22 | Katkaise verkko lähetyksen tai Realtime-yhteyden aikana | Virhe näkyy käyttäjälle tai yhteys palautuu määritellyllä tavalla ilman virheellistä onnistumista | P1           |

Host-reitti on `/host/<sessionId>`, mutta host-sivu hakee session tiedot `host_token`-evästeen perusteella. Osallistujan reitti on `/join/<joinCode>`. Session luonnin yhteydessä API luo kuusimerkkisen joinCoden, joka palautetaan session mukana; host muodostaa siitä QR-koodiin osallistumisosoitteen. Nykyisessä käyttöliittymässä ei ole näkyvää tekstimuotoista join-linkkiä eikä kopiointitoimintoa.

## 4. Testitasot ja menetelmät

### Yksikkö- ja komponenttitestaus

Kun logiikka erotellaan komponenteista testattaviksi moduuleiksi, testataan vähintään:

- sanan trimmaus ja kirjainkoon normalisointi
- tyhjän, liian pitkän ja sallitun syötteen käsittely
- sanojen esiintymien laskenta ja deterministinen järjestys
- visualisointidatan koon ja värin muodostus
- joinCode-pohjainen participantin luonti
- participant ID:n käyttö submission-kutsussa
- onnistumis- ja virhetilan tilasiirtymät

Vitestillä ja React Testing Libraryllä toteutetut testit kattavat session luonnin, joinCode-pohjaisen participantin luonnin, sanasyötteen validoinnin, 25 merkin rajan, onnistuneen ja epäonnistuneen lähetyksen sekä käyttöliittymän tiloja. Kaikki suunnitelmassa mainitut logiikat eivät ole erillisiä testattavia moduuleja.

### End-to-end-testaus

Cypress E2E-testeissä käytetään paikallista Next.js-kehitysympäristöä ja testisessioita:

1. Avaa aloitussivu.
2. Luo session.
3. Avaa esittäjän näkymä.
4. Liity reitillä `/join/<joinCode>`.
5. Lähetä sallittu sana.
6. Varmista sanan näkyminen host-näkymässä.
7. Toista tyhjällä ja whitespace-syötteellä.

Nykyiset Cypress-testit kattavat session luonnin ja host-reitille siirtymisen, hostin tyhjän tilan, Reset-dialogin ja submissionien poiston, tyhjän ja whitespace-syötteen estämisen sekä E2E-03-polun: sessionin luonti, liittyminen `/join/<joinCode>`-reitillä, sanan lähetys ja sanan näkyminen host-näkymässä.

Hostin session-nimen muokkauksen kolme testiä ovat `it.skip`-tilassa eli pending-testejä. Niitä ei merkitä epäonnistuneiksi, vaan ne kirjataan avoimeksi testivelaksi.

### Manuaalinen käyttäjätestaus

Testataan 3–5 kohderyhmään kuuluvaa käyttäjää, joista ainakin yksi käyttää mobiililaitetta. Tehtävät:

- Luo sanapilvi ja jaa se QR-koodilla.
- Liity osallistujana ja lähetä vastaus.
- Selvitä, näkyikö vastaus ja mitä tapahtuu seuraavaksi.
- Käytä toimintoa ilman suullisia lisäohjeita.

Havainnoidaan tehtävän ymmärrettävyyttä, palautteen riittävyyttä, linkin/QR-koodin löydettävyyttä ja pilven tulkittavuutta.

## 5. Supabase-, tietoturva- ja tietosuojatestit

| ID     | Testi                                                                              | Odotettu tulos                                                                                         | Prioriteetti |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| SEC-01 | Lähetä HTML- tai JavaScript-merkkijono                                             | Sisältö käsitellään tekstinä; koodia ei suoriteta                                                      | P0           |
| SEC-02 | Lähetä tyhjä, liian pitkä tai väärän participant ID:n sisältävä pyyntö suoraan API:lle | RLS/tietokanta hylkää pyynnön eikä käyttöliittymä saa väärää onnistumista                         | P0           |
| SEC-03 | Yritä lukea tai lisätä sanoja toiseen sessioniin                               | Hyväksytty käyttäytyminen dokumentoidaan; vähintään käyttöliittymän session-eristys toteutuu           | P0           |
| SEC-04 | Yritä ylittää 500 sanan session raja                                               | Lisäys estyy hallitusti                                                                                | P1           |
| SEC-05 | Tarkista cascade-poisto testiympäristössä                                          | Session poisto poistaa siihen liittyvät sanat                                                          | P1           |
| SEC-06 | Tarkista repository, build ja selainpaketti                                        | Salaisuuksia ei ole lähdekoodissa, Gitissä tai client bundleissa                                       | P0           |
| SEC-07 | Tarkista virheviestit                                                              | Ne eivät paljasta API-avaimia, SQL:ää, sisäisiä tunnuksia tai palvelinrakennetta                       | P1           |
| SEC-08 | Lähetä suuri määrä pyyntöjä yhdestä clientistä                                     | Nykyinen riski kirjataan; ennen julkaisua päätetään rate limitingin tai CAPTCHA:n tarve                | P0           |
| SEC-09 | Tarkista säilytys ja näkyvyys                                                      | Vain toiminnan kannalta tarpeelliset session- ja sanatiedot tallennetaan; säilytysaika on dokumentoitu | P1           |

RLS- ja tietoturvatestit ovat edelleen suunniteltuja, eikä niitä merkitä toteutetuiksi tämän dokumentin testituloksen perusteella. Nykyinen MVP käyttää host_token-evästettä host-session tunnistamiseen, eikä admin-käyttöoikeuksia ole toteutettu.

## 6. Saavutettavuus ja yhteensopivuus

Seuraavat tarkistukset ovat suunniteltuja, eivät toteutuneita automaattisia testejä:

- Kaikki toiminnot ovat käytettävissä näppäimistöllä ja näkyvä kohdistus on havaittavissa.
- Osallistujan kentällä on ohjelmallinen nimilappu, ohje ja virhepalaute.
- Onnistumis- ja virheviestit eivät perustu vain väriin.
- Kontrasti, tekstin zoomaus ja mobiilin kosketuskohteet tarkistetaan.
- QR-kuvalla ja kuvakkeilla on ymmärrettävä vaihtoehtoinen nimi.
- Sanapilvelle tarjotaan tekstimuotoinen vastine tai muu tapa saada sanojen määrät ilman SVG-visualisointia.
- Testataan vähintään ajantasaiset Chrome-, Firefox- ja Edge-selaimet sekä Safari iOS:llä ja Chrome Androidilla.
- Tarkistetaan leveydet vähintään mobiili-, tabletti- ja työpöytänäkymässä.

## 7. Suorituskyky, palautuminen ja rajat

Seuraavat testit ovat suunniteltuja tai testaamattomia:

MVP:lle tehdään kevyt luokkakäytön kuormituskoe sovitulla käyttäjämäärällä. Tavoite ja raja kirjataan ennen testiä; yli tämän rajan tehtävä laaja kuormitustestaus ei kuulu ensimmäiseen hyväksyntään.

Testataan lisäksi:

- 0, 1, 100 ja 500 sanaa sisältävä session
- monta samanaikaista lähettäjää
- selainpäivitys lähetyksen jälkeen
- Realtime-yhteyden katkeaminen ja palautuminen
- Supabase- tai verkkoerheen selkeä palautuminen
- sanapilven renderöinti pienellä ja suurella näyttöalueella

## 8. Testiympäristö, data ja työkalut

- Kehitys: localhost ja erillinen testitietokanta tai testi-sessionit.
- Hyväksyntä: ei määritelty tässä testituloksessa; tuotantodataa ei käytetä.
- Testidata: keinotekoiset sanat ja tunnisteet; ei oikeita henkilötietoja.
- Yksikkö- ja komponenttitestit: Vitest, React Testing Library ja TypeScript.
- Selain- ja E2E-testit: Cypress.
- Saavutettavuus: selainkehitystyökalut ja tarvittaessa Cypressiin liitettävä saavutettavuustarkistus.
- Raportointi: GitHub Issues, jossa testin ID, ympäristö, toistovaiheet, odotettu/toteutunut tulos ja kuvakaappaus tai loki.
- CI: vähintään tyyppitarkistus, build, yksikkötestit ja sovitut kriittiset E2E-testit ennen hyväksyttävää julkaisua.

### 8.1 Toteutuneiden Cypress-testien tulokset

**Komento:** `npm run cy:run`
**Tulokset 20.10.2026:** 11 Cypress-testiä yhteensä, 8 passing, 3 pending, 0 failing.

Pending-testit koskevat hostin session-nimen muokkausta. Niitä ei lasketa epäonnistuneiksi.

Tässä suunnitelmassa ei esitetä testituloksia Vitestille, ellei niitä ole erikseen kirjattu testitulokseksi.

## 9. Riskit

| Riski                                 | Vaikutus                                                     | Hallintatoimenpide                                                                              |
| ------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Julkinen anonyymi kirjoitus           | Roskaposti, vääristyneet tulokset ja kustannus-/kiintiöriski | Syöterajat, session rajat, rate limiting/CAPTCHA-päätös ja kuormitustesti                       |
| Session tunnisteen arvaaminen tai jakaminen | Toisen session tietojen näkyminen                            | Session-eristystestit, tunnisteen elinkaari ja RLS:n uudelleenarviointi                         |
| Realtime- tai verkko-ongelma          | Oppimistilanne keskeytyy                                     | Virhepalaute, palautumistesti ja manuaalinen päivityspolku                                      |
| Puuttuva syötteen validointi          | Virheellinen data tai XSS-riski                              | Selain- ja tietokantatason rajat sekä turvallinen tekstirenderöinti                             |
| Liian aikainen hosting-valinta        | Kiintiöt tai korttivaatimus estävät käytön                   | Vertaile Vercel/Netlify/AWS/Supabase vasta sovittujen liikenne- ja kustannusrajojen perusteella |
| Epäselvä anonyymius                   | Osallistujat eivät uskalla vastata tai odotukset rikkoutuvat | Kerrotaan mitä tallennetaan; tunnistamisen tarve päätetään ennen toteutusta                     |

## 10. MVP:n hyväksymiskriteerit

Tämän testikierroksen perusteella voidaan todeta seuraavaa:

### Toteutuneet testit

- Cypressin toteutuneissa testeissä session luonti ja host-reitille siirtyminen toimivat.
- Hostin tyhjä tila sekä Reset-dialogin ja submissionien poiston polku on testattu.
- Tyhjän ja whitespace-syötteen estäminen on testattu.
- E2E-03-polku kattaa session luonnin, liittymisen `/join/<joinCode>`-reitillä, sanan lähetyksen ja sanan näkymisen host-näkymässä.
- Tuloksena oli 8 passing, 3 pending ja 0 failing Cypress-testiä.

### Pending-testit ja testivelka

- Hostin session-nimen muokkauksen kolme testiä ovat pending (`it.skip`), eivät epäonnistuneita.
- QR-koodin sisällön automaattinen tarkistus, usean osallistujan samanaikaisuus, session-eristys usealla sessiolla, yhteyden katkeaminen ja palautuminen, kuormitus- ja bottisuojaustestit, RLS- ja tietoturvatestit sekä saavutettavuus- ja selain-/mobiiliyhteensopivuustestit ovat jatkotestauksen testivelkaa.

Kaikkien P0-testien hyväksymistä, tietoturvariskien ratkaisemista, kaikkien sovittujen selainten toimivuutta tai hosting-kokonaisuuden riittävyyttä ei voida todeta tämän testikierroksen perusteella. MVP:n lopullinen hyväksyntä edellyttää avoimen testivelan ja suunniteltujen testien erillistä käsittelyä.

## 11. Jatkokehityksen testikehys

Seuraavat ominaisuudet otetaan testattaviksi vasta, kun niiden käyttäytyminen, tietosuoja ja käyttöoikeudet on päätetty:

| Ominaisuus                       | Ennen toteutusta päätettävä                                                        | Vähimmäistestit                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Työkalujen valintanäkymä         | Mitkä työkalut kuuluvat ensimmäiseen julkaisuun ja säilyykö yhteinen session malli | Työkalun valinta, navigointi, suora URL ja takaisinpaluu                                 |
| Session elinkaari ja huoneavain  | Milloin session päättyy, voiko sen palauttaa ja onko 4-numeroinen avain riittävä   | Luonti, liittyminen, vanhentuminen, väärä/varattu avain ja pääsyn esto                   |
| Admin/esittäjän oikeudet         | Miten ensimmäinen käyttäjä todistetaan ja voiko roolin siirtää                     | Valtuutettu toiminto, luvaton URL/API-pyyntö, roolin menetys ja auditointi               |
| Anonyymius versus jäljitettävyys | Tallennetaanko osallistujasta mitään ja mitä opettaja näkee                        | Ilmoitettu tietosisältö, istunnon eristys, poisto ja tietosuojapyyntö                    |
| Ryhmäjako                        | Arvotaanko ryhmä, käytetäänkö QR:ää vai koodia ja voiko jakoa muuttaa              | Tasainen jako, uudelleenliittyminen, ryhmäraja ja samanaikainen käyttö                   |
| Äänestys/fiilismittari           | Yksi vai monta vastausta, tulosten näkyvyys ja anonyymius                          | Arvojen 1–5 rajat, duplikaatit, sulkeminen ja aggregointi                                |
| Blur ja paljastus                | Kuka paljastaa, koskeeko blur kaikkia ja voiko tuloksia muokata ennen paljastusta  | Ennen/jälkeen-tila, päivitykset, suora URL ja saavutettava tekstivastine                 |
| Moderointi                       | Estetäänkö sana ennen tallennusta vai piilotetaanko se jälkeenpäin                 | Kirjoitusasut, kiertoilmaisut, väärät osumat, ilmoitus ja palautus                       |
| Botintorjunta                    | Tarvitaanko CAPTCHA, rate limiting, tokenit vai yhdistelmä                         | Massalähetys, normaalin käyttäjän läpäisy, palvelun kiintiöt ja lokit                    |
| JAMK-brändi ja saavutettavuus    | Mitkä brändiohjeet ovat sovellettavia ja mitä poikkeamia tarvitaan                 | Kontrasti, typografia, responsiivisuus, ruudunlukija ja hyväksytty visuaalinen tarkistus |
| Hosting ja kustannus             | Sallittu palvelu, kiintiöt, cold startit, varmuuskopiot ja korttivaatimus          | Deploy, ympäristömuuttujat, kiintiörajojen käyttäytyminen, palautuminen ja poistaminen   |

Jatkokehitysominaisuudet saavat omat P0–P2-hyväksymiskriteerinsä ennen toteutusta. Näin tekninen ratkaisu, framework ja hosting voidaan valita tarpeen mukaan ilman, että testaussuunnitelma lukitsee toteutuksen liian aikaisin.
