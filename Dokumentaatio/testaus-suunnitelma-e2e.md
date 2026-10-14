***

# Testaussuunnitelma ja testausdokumentaatio

## Pedagogiset työkalut -verkkosovellus

| Tieto | Arvo |
|---|---|
| Dokumentin versio | 1.1 |
| Päivitetty | 14.10.2026 |
| Haara | `testing/tommi` (mergattu `origin/main`, 13.10.2026) |
| Tila | Luonnos, tulokset täytetään testiajojen jälkeen |

***

## 1. Sovelluksen kuvaus

Pedagogiset työkalut on opettajille suunnattu verkkosovellus, joka tukee opetustilanteita ja opiskelijoiden osallistumista. Keskeinen toiminnallisuus on SanaPilvi. Isäntä (opettaja) luo session, ja osallistujat lähettävät siihen sanoja omilta laitteiltaan.

Ensimmäinen pilottiversio toteutettiin Claude AI:n avulla SvelteKitillä ja Supabasella. Nykyinen versio on toteutettu uudelleen, ja arkkitehtuuria on tarkennettu.

## 2. Käytettävät teknologiat

| Osa-alue | Teknologia |
|---|---|
| Käyttöliittymä | React 19, Next.js 16 (App Router), Tailwind CSS 4 |
| Palvelinpuoli | Next.js API-reitit (`/api/session`, `/api/participant`, `/api/submission`), TypeScript |
| Tietokanta ja reaaliaikaisuus | Supabase (Postgres, RLS-politiikat, Realtime) |
| Sanapilven piirto | d3-cloud |
| QR-koodi | qrcode.react |
| Yksikkötestaus | Vitest, React Testing Library |
| E2E-testaus | Cypress |
| Kehitysympäristö | WebStorm, paikallinen `npm run dev` (`localhost:3000`) |

CI/CD-putki voidaan myöhemmin toteuttaa GitHub Actionsilla. Se ei kuulu tämän testausvaiheen rajaukseen.

### 2.1 Arkkitehtuuri testauksen kannalta

- Isännän tunnistus perustuu `host_token`-evästeeseen (httpOnly, voimassa 12 tuntia). Palvelin luo evästeen session luonnin yhteydessä. API-reitit hakevat session evästeen perusteella, ei URL:n `sessionId`:n perusteella.
- Osallistuja liittyy 6-merkkisellä liittymiskoodilla (A–Z, 0–9). Palvelin muuttaa koodin isoiksi kirjaimiksi ennen hakua.
- Session tila on `active` tai `paused`. Sanan lähetys paused-tilassa palauttaa 403 (Session is paused).
- Tietokantamigraatiot ovat kansiossa `supabase/migrations`. Niissä on RLS, Realtime-asetukset, session tilan tarkistus ja session siivous.
- Cypress-testit käyttävät oikeaa paikallista sovellusta ja Supabasea. Vastauksia ei stubata, ellei testi erikseen käytä `cy.intercept`-pysäytystä.

## 3. Testauksen tarkoitus

End-to-end-testauksen tavoitteena on varmistaa, että sovellus toimii käyttäjän näkökulmasta yhtenä kokonaisuutena. Testit jäljittelevät käyttäjän etenemistä käyttöliittymässä ja tarkistavat, että toiminto johtaa käyttäjän kannalta oikeaan lopputulokseen.

SanaPilven keskeinen käyttäjäpolku:

> Isäntä luo session → osallistuja liittyy sessioon → osallistuja lähettää sanan → sana näkyy isännän näkymässä.

Testauksen tarkoituksena on varmistaa tämä käyttäjäpolku ja siihen liittyvät MVP-toiminnot.

## 4. MVP-rajaukset

MVP sisältää seuraavat toiminnot:

- Isäntä voi luoda session.
- Osallistuja voi liittyä sessioon QR-koodin tai liittymislinkin kautta.
- Osallistuja voi lähettää sanan sessioon.
- Isäntä näkee osallistujien lähettämät sanat.
- Isäntä voi resetoida sanapilven sanat.
- Isäntä voi vaihtaa session nimeä.
- Session tiedot pysyvät erillään muista sessioista.
- Käyttäjä saa palautteen onnistuneesta tai epäonnistuneesta toiminnosta.

Session tilan vaihtaminen (`active` / `paused`) on tuettu API:ssa. **[TARKISTA]** Onko isännän näkymässä pause-painike. Jos ei ole, toiminto kuuluu jatkokehitykseen, ja sille on vain API-tason testaus.

QR-koodin fyysistä skannausta kameralla ei automatisoida. Cypressillä testataan, että QR-koodi tai osallistumislinkki muodostetaan oikein ja että linkki avaa oikean osallistujanäkymän. Fyysinen skannaus testataan manuaalisesti (luku 11).

## 5. Testauksen rajaus

Cypress-testit ajetaan paikallisessa testiympäristössä (`localhost:3000`). Seuraavat aiheet rajataan tämän vaiheen ulkopuolelle:

- kuormitustestaus ja usean kymmenen samanaikaisen osallistujan testaaminen
- spämmisuojaus ja bottien torjunta
- session automaattisen vanhenemisen toiminta (**[TARKISTA]**: siivousmigraatio on olemassa, mutta sen toimintaa ei testata tässä vaiheessa)
- laaja selainyhteensopivuustestaus (Cypress ajetaan oletusselaimella)
- automaattinen CI/CD-ajo
- laajempi saavutettavuusarviointi
- fyysisen QR-koodin skannaus kameralla

## 6. Vaatimusmäärittely

`TV` tarkoittaa toiminnallista ja `EV` ei-toiminnallista vaatimusta. Jokaiselle vaatimukselle on hyväksymiskriteeri.

### 6.1 Prioriteetit

| Prioriteetti | Merkitys |
|---|---|
| P0 | Kriittinen. Ilman sitä ydinkäyttäjäpolku ei toimi. |
| P1 | Tärkeä. Parantaa käytettävyyttä tai luotettavuutta, mutta peruspolku voi toimia ilman sitä. |
| P2 | Jatkokehitys. Ei kuulu tämän vaiheen MVP-hyväksymistestaukseen. |

### 6.2 Toiminnalliset vaatimukset

| ID | Vaatimus | Hyväksymiskriteeri | Prio |
|---|---|---|---|
| TV-01 | Isäntä voi luoda uuden session. | Sessionäkymä avautuu ja sessiolle muodostuu yksilöllinen tunniste. | P0 |
| TV-02 | Osallistuja voi liittyä sessioon QR-koodin tai liittymislinkin kautta. | Linkin avaaminen ohjaa oikean session osallistujanäkymään. | P0 |
| TV-03 | Osallistuja voi syöttää sanan tai lyhyen vastauksen. | Syöttökenttä vastaanottaa hyväksyttävän syötteen (enintään 25 merkkiä). | P0 |
| TV-04 | Osallistuja voi lähettää sanan sessioon. | Sana tallentuu ja käyttäjälle näytetään lähetyksen onnistuminen. | P0 |
| TV-05 | Lähetetty sana näkyy isännän näkymässä. | Sana ilmestyy isännän sanapilveen ilman manuaalista sivun päivitystä. | P0 |
| TV-06 | Tyhjää tai vain välilyöntejä sisältävää syötettä ei voi lähettää. | Lähetys estetään eikä tyhjää arvoa tallenneta. | P1 |
| TV-07 | Isäntä voi resetoida sanapilven sanat. | Reset poistaa sanat, mutta sessio säilyy. | P1 |
| TV-08 | Isäntä voi vaihtaa session nimeä. | Uusi nimi näkyy isännän näkymässä ja tunniste säilyy. | P1 |
| TV-09 | Nimen vaihtaminen ei poista sanoja. | Aiemmin lähetetyt sanat säilyvät. | P1 |
| TV-10 | Käyttäjä saa palautteen onnistumisesta tai epäonnistumisesta. | Käyttäjä näkee ymmärrettävän onnistumis- tai virheilmoituksen. | P1 |
| TV-11 | Eri sessioiden tiedot pysyvät erillään. | Yhteen sessioon lähetetty sana ei näy toisessa sessiossa. | P0 |

### 6.3 Ei-toiminnalliset vaatimukset

| ID | Vaatimus | Hyväksymiskriteeri | Prio |
|---|---|---|---|
| EV-01 | Osallistuja käyttää keskeisiä toimintoja mobiililaitteella. | Liittyminen, syöttö ja lähetys onnistuvat mobiiliselaimella. | P0 |
| EV-02 | Mobiilinäkymä on responsiivinen. | Toimii yleisillä puhelinleveyksillä ilman vaakavieritystä. | P1 |
| EV-03 | Isännän näkymä on luettava suurelta näytöltä. | Sanapilven sisältö on luettavissa luokkatilanteen näytöltä tai projektorilta. | P1 |
| EV-04 | Keskeiset toiminnot ovat ymmärrettäviä. | Käyttäjä tunnistaa liittymisen, lähetyksen, Reset-toiminnon ja nimen vaihdon ilman tulkinnanvaraa. | P1 |
| EV-05 | Saavutettavuuden perustaso täyttyy. | Lomakekentillä on selkeät otsikot, isännän näkymä toimii näppäimistöllä, merkitys ei välity vain värillä. | P1 |
| EV-06 | Käyttäjätietoja käsitellään mahdollisimman vähän. | Osallistujalta ei pyydetä tietoja liittymiskoodin lisäksi. | P1 |

## 7. Testitapausten suunnitteluperiaatteet

Testitapaukset suunnitellaan käyttäjän tavoitteen ja havaittavan hyväksymiskriteerin perusteella. Tavoitteena on varmistaa käyttäjälle merkityksellinen lopputulos, ei pelkästään yksittäisen painikkeen toiminta.

Testit pidetään pieninä, mutta niiden tulee sulkea pois harhaanjohtavan onnistumisen tilanteet. Esimerkiksi pelkkä HTTP 200 -vastaus ei riitä, vaan testin pitää tarkistaa myös käyttöliittymän lopputila. Epäonnistuneen testin yhteydessä arvioidaan, johtuuko havainto sovelluksesta, testidatasta, testiympäristöstä vai testin toteutuksesta.

Lisäperiaatteet:

- Jokainen testi luo oman session eikä riipu toisen testin datasta.
- Valitsimina käytetään ensisijaisesti `data-testid`-attribuutteja, ei tekstiä tai tagia.
- Odotukset perustuvat `cy.intercept`-aliaksiin ja `should`-ehtoihin, ei kiinteisiin `cy.wait(ms)`-viiveisiin.

## 8. Testiympäristö ja ajo-ohje

| Kohde | Arvo |
|---|---|
| Sovelluksen osoite | `http://localhost:3000` |
| Tietokanta | Supabase. **[TARKISTA]** Onko instanssi paikallinen vai pilvessä, ja onko se erillinen tuotannosta. |
| Käynnistys | `npm run dev` (ensimmäinen terminaali) |
| Cypress interaktiivisesti | `npm run cy:open` |
| Cypress komentoriviltä | `npm run cy:run` |
| Yksikkötestit | `npm run test:run` |
| Lint | `npm run lint` |
| Tuotantokäännös | `npm run build` |

Ennen ajoa tarkistetaan, että `.env`-tiedostossa (tai `.env.local`) on Supabase-avaimet ja että kehityspalvelin on käynnissä. Cypress ei käynnistä sovellusta itse.

## 9. Testitasot ja nykytila

### 9.1 Yksikkötestit (Vitest)

Tilanne 13.10.2026 mergen `origin/main`-haaran jälkeen: 5 tiedostoa ja 22 testiä menivät läpi.

| Tiedosto | Testejä | Kohde |
|---|---|---|
| `tests/unit/backend/participant.test.ts` | 1 | Osallistuja-API: puuttuva liittymiskoodi palauttaa 400 |
| `tests/unit/backend/sessions.test.ts` | 3 | Session-API |
| `tests/unit/backend/submission.test.ts` | 2 | Sanan lähetys -API |
| `src/app/page.test.tsx` | 3 | Etusivu |
| `src/app/user/[join_code]/page.test.tsx` | 13 | Osallistujanäkymä: syöttö, 25 merkin raja, Send-painikkeen estyminen, onnistunut lähetys, virhetilat |

### 9.2 E2E-testit (Cypress), nykyiset

| Tiedosto | Testi | Kattaa | Tila |
|---|---|---|---|
| `session.cy.ts` | Luo session ja siirtyy host-näkymään | TV-01 | Toteutettu |
| `host.cy.ts` | Tyhjä tila näytetään, kun sanoja ei ole | TV-05 (alkutila) | Toteutettu |
| `host.cy.ts` | Reset avaa vahvistuksen, Cancel sulkee sen | TV-07 (peruutus) | Toteutettu |
| `host.cy.ts` | Reset kutsuu `DELETE /api/submission` ja dialogi sulkeutuu | TV-07 | Toteutettu |
| `host.cy.ts` | Nimen vaihto tallentuu blurilla ja päivittyy otsikkoon | TV-08 | Toteutettu |
| `host.cy.ts` | Tyhjä nimi näyttää virheen eikä lähetä PATCH-kutsua | TV-08, TV-10 | **Ohitettu (`it.skip`)** |

Ohitetun testin kommentti viittaa paikkamerkkiin `Issue #XX`. Oikea issue on #77, joten paikkamerkki korvataan sillä. Testin valitsin `input[type="text"]` on lisäksi epävarma. Muut testit käyttävät `data-testid`-valitsinta, ja ohitetunkin testin pitäisi käyttää samaa `session-name-input`-valitsinta.

### 9.3 Uusittavat Cypress-testit

Nämä testit puuttuvat ja ne kirjoitetaan seuraavaksi. Ydinpolun testi (CY-01) on tärkein, koska se todentaa kaikki P0-vaatimukset yhdessä.

| ID | Testitapaus | Vaatimukset | Prio | Tila |
|---|---|---|---|---|
| CY-01 | Ydinpolku: isäntä luo session, osallistuja avaa liittymislinkin, lähettää sanan, sana näkyy isännän näkymässä ilman sivun päivitystä | TV-01–TV-05 | P0 | Suunniteltu |
| CY-02 | Liittymislinkki muodostetaan oikein: isännän näkymän QR-koodin tai linkin osoite sisältää session `join_code`:n ja avaa osallistujanäkymän | TV-02 | P0 | Suunniteltu |
| CY-03 | Virheellinen tai tuntematon liittymiskoodi näyttää virheilmoituksen | TV-10 | P1 | Suunniteltu |
| CY-04 | Tyhjä ja pelkkiä välilyöntejä sisältävä syöte ei lähde, eikä sitä tallenneta | TV-06 | P1 | Suunniteltu |
| CY-05 | 25 merkin raja: pidempää syötettä ei voi lähettää | TV-03 | P1 | Suunniteltu |
| CY-06 | Kahden session eristys: sana sessiossa A ei näy sessiossa B | TV-11 | P0 | Suunniteltu |
| CY-07 | Reset poistaa sanat isännän näkymästä ja sessio säilyy | TV-07 | P1 | Suunniteltu (laajennus nykyiseen) |
| CY-08 | Nimen vaihdon jälkeen aiemmin lähetetyt sanat säilyvät | TV-09 | P1 | Suunniteltu |
| CY-09 | Epäonnistunut lähetys (`cy.intercept` palauttaa 500) näyttää virheilmoituksen ja palauttaa syöttönäkymään | TV-10 | P1 | Suunniteltu |
| CY-10 | Osallistujanäkymä mobiilileveydellä (`cy.viewport` 375×667): ei vaakavieritystä, liittyminen ja lähetys onnistuvat | EV-01, EV-02 | P0/P1 | Suunniteltu |
| CY-11 | Tyhjän session nimen validointi (nykyisen ohitetun testin korjaus, issue #77) | TV-08, TV-10 | P1 | Odottaa UI-korjausta |

Huomioita toteutukseen:

- CY-01 ja CY-06 vaativat kaksi roolia. Isäntä ja osallistuja ovat eri evästekonteksteja. Osallistujan toiminta tehdään joko `cy.origin`/`cy.session`-tekniikalla tai `cy.request`-kutsuilla (`POST /api/participant`, `POST /api/submission`), ja isännän tulos tarkistetaan käyttöliittymästä. Tämä on testisuunnittelun avoin ratkaisu.
- TV-05:n vaatimus "ilman manuaalista päivitystä" tarkoittaa, ettei testi saa kutsua `cy.reload()`. Realtime-päivitys todennetaan odottamalla sanaa isännän näkymässä.
- Testien tulee siivota luomansa sessiot (esimerkiksi `DELETE /api/session` testin lopuksi), jotta tietokantaan ei kerry testidataa.

## 10. Jäljitettävyysmatriisi

| Vaatimus | Yksikkötesti | Cypress (nykyinen) | Cypress (suunniteltu) | Kattavuus nyt |
|---|---|---|---|---|
| TV-01 | Kyllä | session.cy.ts | CY-01 | Hyvä |
| TV-02 | Osittain | – | CY-01, CY-02 | **Puuttuu E2E** |
| TV-03 | Kyllä (25 merkkiä) | – | CY-05 | Vain yksikkö |
| TV-04 | Kyllä | – | CY-01 | Vain yksikkö |
| TV-05 | – | Vain tyhjä tila | CY-01 | **Puuttuu E2E** |
| TV-06 | Kyllä (Send estetty) | – | CY-04 | Vain yksikkö |
| TV-07 | – | host.cy.ts | CY-07 | Osittain (sanojen poistoa ei todenneta) |
| TV-08 | – | host.cy.ts | CY-11 | Osittain (tyhjä nimi ohitettu) |
| TV-09 | – | – | CY-08 | **Puuttuu** |
| TV-10 | Kyllä (virhetilat) | – | CY-03, CY-09, CY-11 | Vain yksikkö |
| TV-11 | – | – | CY-06 | **Puuttuu** |
| EV-01, EV-02 | – | – | CY-10 | **Puuttuu** |
| EV-03–EV-06 | – | – | – | Manuaalinen (luku 11) |

## 11. Manuaaliset testit

| ID | Testi | Vaatimus | Tulos |
|---|---|---|---|
| MT-01 | QR-koodin skannaus puhelimen kameralla avaa oikean osallistujanäkymän | TV-02 | |
| MT-02 | Ydinpolku oikealla puhelimella (iOS Safari ja Android Chrome) | EV-01 | |
| MT-03 | Isännän näkymän luettavuus projektorilta tai suurelta näytöltä | EV-03 | |
| MT-04 | Isännän näkymän käyttö pelkällä näppäimistöllä (Tab, Enter, Esc) | EV-05 | |
| MT-05 | Merkitys ei välity vain värillä (tilat, virheet) | EV-05 | |
| MT-06 | Lomakekentillä on näkyvä tai ruudunlukijalle luettava otsikko | EV-05 | |
| MT-07 | Uusi käyttäjä ymmärtää liittymisen, lähetyksen, Resetin ja nimen vaihdon ilman ohjetta (3–5 hengen pikatesti) | EV-04 | |

## 12. Testitulokset

Täytetään jokaisen ajon jälkeen.

| Ajo | Päivä | Työkalu | Läpi | Hylätty | Ohitettu | Huomio |
|---|---|---|---|---|---|---|
| 1 | 13.10.2026 | Vitest (`test:run`) | 22 | 0 | 0 | Merge-haaran jälkeen |
| 2 | 13.10.2026 | Lint (`lint`) | – | 0 virhettä | – | 4 varoitusta (H-06) |
| 3 | 14.10.2026 | Cypress (`cy:run`) | 5 | 0 | 1 (H-02, tunnettu) | `host.cy.ts` 4/5, `session.cy.ts` 1/1. Electron-kaatumista ei toistunut (H-13). |
| 4 | 14.10.2026 | Build (`build`) | Läpi | 0 | – | `.env.local` oli käytössä. 7/7 sivua generoitu. |

## 13. Havainnot

### 13.1 Testauksessa havaitut asiat

| ID | Havainto | Vakavuus | Vaikutus | Tila / toimenpide |
|---|---|---|---|---|
| H-01 | Ydinpolulle ei ole E2E-testiä (TV-02, TV-04, TV-05, TV-11). | Korkea | P0-vaatimukset todennettu vain yksikkötasolla. | Kirjoitetaan CY-01, CY-02, CY-06 |
| H-02 | Isännän näkymä ei näytä virhettä, kun session nimi tyhjennetään. Testi on ohitettu (`it.skip`). Testin kommentissa on paikkamerkki `Issue #XX`. Aiempi viittaus #56 oli väärä, koska se koskee Cypressin smoke-testin kokeilua. Oikea issue on #77 "Isännän näkymä ei näytä virhettä, kun session nimi tyhjennetään". | Keskitaso | Käyttäjä ei saa palautetta (TV-10). Luokka: sovellusvirhe. | Issue #77 on olemassa. Korvaa kommentin `#XX` luvulla `#77` ja päätä, pidetäänkö #77 GitHub Projectissa. Testi aktivoidaan (CY-11), kun UI on korjattu. |
| H-03 | `participant`-API:n POST-käsittelijä tulostaa konsoliin koko pyynnön rungon (`console.log(body)`). | Matala | Debug-tuloste jäänyt tuotantokoodiin. | Poistettava ennen julkaisua |
| H-04 | Testikoodissa `act(...)`-varoituksia (`UserPage`). | Matala | Ei vaikuta toimintaan, mutta tilapäivityksiä ei ole odotettu testissä. | Kääri `act`/`waitFor`-rakenteisiin |
| H-05 | Testissä `Invalid DOM property stroke-linecap` / `stroke-linejoin`. | Matala | SVG-attribuutit väärin muodossa (pitää olla `strokeLinecap`, `strokeLinejoin`). | Korjataan, jos virhe on sovelluskoodissa **[TARKISTA]**, ei vain mockissa |
| H-06 | Lint-varoitukset: `<img>` ilman `alt`-attribuuttia testitiedostossa (`page.test.tsx`) ja käyttämättömät `on`, `config` tiedostossa `cypress.config.ts`. | Matala | Ei toiminnallista vaikutusta. | Siivotaan |
| H-07 | `vitest.config.ts` käyttää ESM-syntaksia CommonJS-tiedostona. | Matala | Varoitus. Tuleva Vite-versio voi vaatia muutosta. | Nimeä `vitest.config.mts` tai lisää `"type": "module"` |
| H-08 | Isännän oikeus perustuu evästeeseen, ei URL:n `sessionId`:hen. Uusi session luonti samassa selaimessa korvaa vanhan `host_token`-evästeen. | Keskitaso | Isäntä voi menettää hallinnan vanhaan sessioon, jos luo uuden samassa selaimessa. **[TARKISTA]** | Testataan CY-06:n yhteydessä, päätetään tarvitaanko varoitus |
| H-09 | Liittymiskoodi arvotaan `Math.random()`-funktiolla, ja törmäyksen käsittely on epäselvä. **[TARKISTA]** onko `join_code` uniikki tietokannassa. | Matala | Harvinainen törmäys voisi yhdistää eri sessiot. | Tarkista tietokannan UNIQUE-rajoite |
| H-10 | Cypress ajaa oikeaa Supabasea vasten, eikä testidatan siivous ole varmistettu. | Keskitaso | Tietokantaan kertyy testisessioita. | Lisää siivous testien `after`-koukkuun |
| H-11 | `cypress.config.ts` sisältää `projectId`-arvon. | Matala | Cypress Cloud -tunniste versionhallinnassa. | Tarkista, onko tarkoituksellinen |
| H-13 | Cypress-käyttöliittymän (`cy:open`) Electron-välilehti kaatui kerran `host.cy.ts`-ajossa. Headless-ajo (`cy:run`) meni läpi 14.10.2026. | Matala | Epävakaus testiympäristössä, ei sovelluksessa. Luokka: testiympäristö. | Ei toistunut headless-ajossa 14.10.2026. Seurataan. Jos toistuu, vakavuus nostetaan. |

### 13.2 Havaintojen luokittelu

Epäonnistuneen testin syy luokitellaan yhteen luokkaan: sovellusvirhe, testidata, testiympäristö tai testin toteutus.

| Havainto | Luokka |
|---|---|
| H-02 | Sovellusvirhe |
| H-04, H-06 | Testin toteutus |
| H-13 | Testiympäristö |

## 14. Tunnetut rajoitteet

- Cypress ei testaa fyysistä QR-skannausta.
- Testit eivät kata kuormaa eivätkä useita samanaikaisia osallistujia.
- Spämmi- ja bottisuojaus puuttuu MVP:stä, ja siihen liittyvää testausta ei tehdä.
- Testit ajetaan yhdellä selaimella (Cypress-oletus).
- Realtime-päivityksen viive riippuu Supabase-yhteydestä, ja testien aikarajat voivat tehdä siitä epävakaan (flaky).

## 15. Hyväksymiskriteerit testausvaiheelle

Testausvaihe on valmis, kun:

1. Kaikki P0-vaatimukset (TV-01–05, TV-11, EV-01) on todennettu vähintään yhdellä läpimenevällä testillä.
2. CY-01 (ydinpolku) menee läpi kolme kertaa peräkkäin ilman uudelleenyritystä.
3. Yksikkötestit, lint ja build menevät läpi ilman virheitä.
4. Kaikilla ohitetuilla testeillä on oikea issue-linkki.
5. Havainnot H-01–H-13 on käsitelty, siirretty issueiksi tai perusteltu tunnetuksi rajoitteeksi.
6. Manuaaliset testit MT-01–MT-07 on ajettu ja tulokset kirjattu.

## 16. Työjärjestys ja seuraavat askeleet

| # | Tehtävä | Tila |
|---|---|---|
| 1 | Merge `origin/main`, yksikkötestit ja lint | Valmis 13.10.2026 |
| 2 | `.idea/` lisätty `.gitignore`-tiedostoon | Valmis |
| 3 | Cypressin screenshotit ja videot ohitettu versionhallinnassa | Valmis |
| 4 | Haara pushattu `origin/testing/tommi` | Valmis |
| 5 | `npm run build` ajettu läpi | Valmis 14.10.2026 |
| 6 | Nykyiset Cypress-testit ajettu ja ajo kirjattu lukuun 12 | Valmis 14.10.2026 |
| 7 | Korvaa `Issue #XX` luvulla `Issue #77` testin kommentissa (`host.cy.ts`) ja päätä, pidetäänkö #77 Projectissa | Avoin |
| 8 | Kirjoita CY-01, CY-02, CY-06 (P0) ja aja CY-01 kolme kertaa peräkkäin | Avoin |
| 9 | Kirjoita CY-03–CY-05, CY-07–CY-10 (P1) | Avoin |
| 10 | Siirrä havainnot H-01, H-03–H-11 ja H-13 (jos toistuu) issueiksi ja poista omat issuet GitHub Projectista | Avoin |
| 11 | Aja manuaaliset testit MT-01–MT-07 | Avoin |
| 12 | Päivitä luvut 9, 10, 12 ja 13 lopullisilla tuloksilla, nosta versio 2.0 | Avoin |

***