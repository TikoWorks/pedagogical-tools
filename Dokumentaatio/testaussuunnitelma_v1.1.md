# Testaussuunnitelma: Pedagoginen sanapilvisovellus

**Versio:** 0.2
**Päivämäärä:** 21.09.2026
**Testattava versio:** [commit / staging-URL]

## 1. Tarkoitus ja rajaus

Sanapilvi on anonyymi, reaaliaikainen pedagoginen työkalu. Esittäjä luo session, jakaa osallistumislinkin tai QR-koodin ja osallistujat lähettävät sanoja. Esittäjän näkymä näyttää sanojen lukumäärät sanapilvenä.

Tämä suunnitelma koskee ensin nykyistä MVP:tä:

- session luonti aloitussivulta
- esittäjän sessionäkymä
- osallistumislinkki ja QR-koodi
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
- QR-koodi ja linkki johtavat toimivaan osallistumisnäkymään
- käyttö toimii sovituilla selaimilla, mobiilissa ja näppäimistöllä
- anonyymi käyttö ei paljasta tarpeettomia henkilötietoja
- Supabase RLS, session-eristys ja käyttörajat vastaavat hyväksyttyä riskiä
- julkaisu voidaan ajaa valitussa ilmaisessa ympäristössä ilman pakollista luottokorttia

## 3. Testattava toiminnallisuus

### 3.1 Session luonti ja esittäjän näkymä

| ID     | Testi                                                      | Odotettu tulos                                                        | Prioriteetti |
| ------ | ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------ |
| MVP-01 | Avaa aloitussivu toimivilla Supabase-asetuksilla           | Luontipainike näkyy ja on käytettävissä                               | P0           |
| MVP-02 | Luo uusi sanapilvi                                         | Uusi session syntyy ja käyttäjä siirtyy `/session/[id]`-näkymään      | P0           |
| MVP-03 | Luo useita sessioita peräkkäin                             | Jokaisella on yksilöllinen tunniste ja omat sanat                     | P1           |
| MVP-04 | Avaa aloitussivu ilman Supabase-asetuksia                  | Käyttäjälle näytetään ymmärrettävä ohje; luonti ei käynnisty          | P1           |
| MVP-05 | Avaa esittäjän näkymä suoraan kelvollisella session ID:llä | Näkymä latautuu ja odotusteksti näkyy ilman sanoja                    | P0           |
| MVP-06 | Tarkista QR-koodi ja osallistumislinkki                    | Molemmat sisältävät saman session ID:n ja avaavat osallistumisnäkymän | P0           |
| MVP-07 | Kopioi linkki selaimen Clipboard API:lla ja ilman sitä     | Onnistuminen näytetään; epäonnistuminen ei riko näkymää               | P1           |

### 3.2 Osallistujan sanan lähettäminen

| ID     | Testi                                                           | Odotettu tulos                                                                                    | Prioriteetti |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| MVP-08 | Lähetä tavallinen sana                                          | Sana tallennetaan ja onnistumisilmoitus näytetään                                                 | P0           |
| MVP-09 | Lähetä sana pienillä kirjaimilla ja ympäröivillä välilyönneillä | Tallennettu arvo on trimattu ja normalisoitu isoksi                                               | P0           |
| MVP-10 | Lähetä tyhjä tai vain välilyöntejä sisältävä arvo               | Lähetys estyy eikä tyhjää riviä tallenneta                                                        | P0           |
| MVP-11 | Syötä 30 merkkiä                                                | Syöte voidaan hyväksyä                                                                            | P1           |
| MVP-12 | Ylitä 30 merkin raja tai ohita selainrajoite pyynnöllä          | Supabase hylkää syötteen hallitusti; käyttöliittymä ei väitä onnistumista                         | P0           |
| MVP-13 | Lähetä erikoismerkkejä, ääkkösiä, emoji ja useita sanoja        | Sovittu tekstisisältö säilyy turvallisesti; käyttöliittymä ei suorita sisältöä                    | P1           |
| MVP-14 | Paina lähetystä nopeasti useita kertoja                         | Lähetyksen aikainen esto estää tahattoman tuplalähetyksen; palvelinrajoitukset testataan erikseen | P1           |
| MVP-15 | Lähetä sana olemattomaan session ID:hen                         | Käyttäjälle näytetään epäonnistuminen eikä vastausta tallenneta                                   | P0           |

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

## 4. Testitasot ja menetelmät

### Yksikkö- ja integraatiotestaus

Kun logiikka erotellaan komponenteista testattaviksi moduuleiksi, testataan vähintään:

- sanan trimmaus ja kirjainkoon normalisointi
- tyhjän, liian pitkän ja sallitun syötteen käsittely
- sanojen esiintymien laskenta ja deterministinen järjestys
- visualisointidatan koon ja värin muodostus
- session ID:n käyttö kyselyiden suodattimena
- onnistumis- ja virhetilan tilasiirtymät

Nykyisessä koodissa nämä eivät kaikki ole erillisiä funktioita. Testattavaa käyttäytymistä ei saa jättää testaamatta vain siksi, että se on tällä hetkellä Svelte-komponentin sisällä.

### End-to-end-testaus

E2E-testissä käytetään erillistä Supabase-testiprojektia tai hallittua testiympäristöä:

1. Avaa aloitussivu.
2. Luo session.
3. Avaa esittäjän näkymä ja varmista QR/linkki.
4. Avaa osallistumislinkki toisessa selainkontekstissa.
5. Lähetä sallittu sana.
6. Varmista onnistumispalaute ja Realtime-päivitys esittäjälle.
7. Toista virheellisillä syötteillä ja olemattomalla session ID:llä.

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
| SEC-02 | Lähetä tyhjä, liian pitkä tai väärän session ID:n sisältävä pyyntö suoraan API:lle | RLS/tietokanta hylkää pyynnön eikä käyttöliittymä saa väärää onnistumista                              | P0           |
| SEC-03 | Yritä lukea tai lisätä sanoja toiseen session ID:hen                               | Hyväksytty käyttäytyminen dokumentoidaan; vähintään käyttöliittymän session-eristys toteutuu           | P0           |
| SEC-04 | Yritä ylittää 500 sanan session raja                                               | Lisäys estyy hallitusti                                                                                | P1           |
| SEC-05 | Tarkista cascade-poisto testiympäristössä                                          | Session poisto poistaa siihen liittyvät sanat                                                          | P1           |
| SEC-06 | Tarkista repository, build ja selainpaketti                                        | Salaisuuksia ei ole lähdekoodissa, Gitissä tai client bundleissa                                       | P0           |
| SEC-07 | Tarkista virheviestit                                                              | Ne eivät paljasta API-avaimia, SQL:ää, sisäisiä tunnuksia tai palvelinrakennetta                       | P1           |
| SEC-08 | Lähetä suuri määrä pyyntöjä yhdestä clientistä                                     | Nykyinen riski kirjataan; ennen julkaisua päätetään rate limitingin tai CAPTCHA:n tarve                | P0           |
| SEC-09 | Tarkista säilytys ja näkyvyys                                                      | Vain toiminnan kannalta tarpeelliset session- ja sanatiedot tallennetaan; säilytysaika on dokumentoitu | P1           |

Nykyinen MVP on anonyymi ja sallii Supabasen julkiset luku-/kirjoitusoikeudet. Tämä on tietoinen riski, ei todiste opettajan hallintaoikeudesta. Admin-käyttöoikeuksia ei saa merkitä testatuksi ennen kuin autentikointi ja palvelinpuolen valtuutus on toteutettu.

## 6. Saavutettavuus ja yhteensopivuus

- Kaikki toiminnot ovat käytettävissä näppäimistöllä ja näkyvä kohdistus on havaittavissa.
- Osallistujan kentällä on ohjelmallinen nimilappu, ohje ja virhepalaute.
- Onnistumis- ja virheviestit eivät perustu vain väriin.
- Kontrasti, tekstin zoomaus ja mobiilin kosketuskohteet tarkistetaan.
- QR-kuvalla ja kuvakkeilla on ymmärrettävä vaihtoehtoinen nimi.
- Sanapilvelle tarjotaan tekstimuotoinen vastine tai muu tapa saada sanojen määrät ilman SVG-visualisointia.
- Testataan vähintään ajantasaiset Chrome-, Firefox- ja Edge-selaimet sekä Safari iOS:llä ja Chrome Androidilla.
- Tarkistetaan leveydet vähintään mobiili-, tabletti- ja työpöytänäkymässä.

## 7. Suorituskyky, palautuminen ja rajat

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
- Hyväksyntä: staging tai julkaistu testiversio, ei tuotantodataa.
- Testidata: keinotekoiset sanat ja session ID:t; ei oikeita henkilötietoja.
- Yksikkö-/integraatiotestit: Vitest nykyiseen SvelteKit/Vite-pinoon.
- Selain- ja E2E-testit: Playwright, mukaan lukien selainkontekstit esittäjälle ja osallistujalle.
- Saavutettavuus: selainkehitystyökalut ja tarvittaessa Playwrightiin liitettävä saavutettavuustarkistus.
- Raportointi: GitHub Issues, jossa testin ID, ympäristö, toistovaiheet, odotettu/toteutunut tulos ja kuvakaappaus tai loki.
- CI: vähintään tyyppitarkistus, build, yksikkötestit ja sovitut kriittiset E2E-testit ennen hyväksyttävää julkaisua.

Vitest- ja Playwright-riippuvuudet lisätään vasta toteutusvaiheessa. Hosting- ja framework-päätös voi muuttaa CI:n tai ympäristömuuttujien toteutusta, mutta ei tämän testikattavuuden tavoitteita.

## 9. Riskit

| Riski                                 | Vaikutus                                                     | Hallintatoimenpide                                                                              |
| ------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Julkinen anonyymi kirjoitus           | Roskaposti, vääristyneet tulokset ja kustannus-/kiintiöriski | Syöterajat, session rajat, rate limiting/CAPTCHA-päätös ja kuormitustesti                       |
| Session ID:n arvaaminen tai jakaminen | Toisen session tietojen näkyminen                            | Session-eristystestit, tunnisteen elinkaari ja RLS:n uudelleenarviointi                         |
| Realtime- tai verkko-ongelma          | Oppimistilanne keskeytyy                                     | Virhepalaute, palautumistesti ja manuaalinen päivityspolku                                      |
| Puuttuva syötteen validointi          | Virheellinen data tai XSS-riski                              | Selain- ja tietokantatason rajat sekä turvallinen tekstirenderöinti                             |
| Liian aikainen hosting-valinta        | Kiintiöt tai korttivaatimus estävät käytön                   | Vertaile Vercel/Netlify/AWS/Supabase vasta sovittujen liikenne- ja kustannusrajojen perusteella |
| Epäselvä anonyymius                   | Osallistujat eivät uskalla vastata tai odotukset rikkoutuvat | Kerrotaan mitä tallennetaan; tunnistamisen tarve päätetään ennen toteutusta                     |

## 10. MVP:n hyväksymiskriteerit

MVP voidaan hyväksyä, kun:

- kaikki P0-testit ovat hyväksyttyjä
- yhtään kriittistä tietoturva- tai tietosuojariskiä ei ole ratkaisematta tai hyväksytysti rajattu
- session luonti, osallistumislinkki, sanan lähetys ja Realtime-päivitys toimivat päästä päähän
- session sanat eivät sekoitu toisen session sanoihin
- virheelliset syötteet ja yhteysvirheet antavat ymmärrettävän palautteen
- sovitut selaimet, mobiilinäkymät ja näppäimistöpolut toimivat
- testitulos, testiversio, ympäristö ja avoimet poikkeamat on kirjattu
- valittu ilmainen hosting-kokonaisuus ei vaadi käyttäjältä luottokorttia ja sen kiintiöt riittävät sovittuun käyttöön

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
