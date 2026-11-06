'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

// Vastausmäärät arvoille 1–5 tässä järjestyksessä.
// Esimerkiksi [2, 3, 6, 7, 2] tarkoittaa:
// arvo 1 sai kaksi vastausta, arvo 2 kolme vastausta jne.
type VoteCounts = readonly [number, number, number, number, number];

// Näkymälle annettavat tiedot.
// Kysymystä voi muokata paikallisesti, mutta vastausmäärät tulevat propseina.
type MpToolResultsViewProps = {
    initialQuestion: string;
    lowLabel: string;
    highLabel: string;
    counts: VoteCounts;
};

// Pylväiden värit arvoille 1–5.
// Luokkien järjestys vastaa counts-taulukon järjestystä.
const barColors = [
    'bg-yellow-300',
    'bg-vaalea',
    'bg-emerald-300',
    'bg-sky-400',
    'bg-violet-400',
];

// Muokkaus- ja esitystilapainikkeiden yhteiset tyylit.
// Mukana ovat myös näppäimistökohdistus ja vähennetyn liikkeen huomiointi.
const secondaryButton =
    'min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm ' +
    'font-bold text-white transition-colors duration-150 ' +
    'hover:border-white/40 hover:bg-white/10 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-4 ' +
    'focus-visible:outline-yellow-300 motion-reduce:transition-none';

export default function MpToolResultsView({
                                              initialQuestion,
                                              lowLabel,
                                              highLabel,
                                              counts,
                                          }: MpToolResultsViewProps) {
    // Tallennettu kysymys ja muokkauskentän keskeneräinen luonnos
    // pidetään erillään, jotta muokkauksen voi myös perua.
    const [question, setQuestion] = useState(initialQuestion);
    const [draftQuestion, setDraftQuestion] = useState(initialQuestion);

    // Näkymän paikalliset käyttöliittymätilat.
    const [isEditing, setIsEditing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isPresenting, setIsPresenting] = useState(false);

    // Viittaukset elementteihin, joihin siirretään näppäimistökohdistus.
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const questionInputRef = useRef<HTMLInputElement>(null);
    const presentationButtonRef = useRef<HTMLButtonElement>(null);

    // Vastausten kokonaismäärä lasketaan kaikkien vaihtoehtojen summana.
    const total = counts.reduce((sum, count) => sum + count, 0);

    // Painotettu summa: jokainen arvo kerrotaan sen vastausmäärällä.
    // Taulukon indeksi alkaa nollasta, joten varsinainen arvo on index + 1.
    const weightedSum = counts.reduce(
        (sum, count, index) => sum + count * (index + 1),
        0,
    );

    // Keskiarvo johdetaan samasta aineistosta kuin pylväät ja kokonaismäärä.
    // Ilman vastauksia keskiarvoa ei ole, joten käytetään null-arvoa.
    const average = total > 0 ? weightedSum / total : null;

    // Kun kysymyksen muokkaus avataan, kohdistetaan suoraan tekstikenttään.
    useEffect(() => {
        if (isEditing) {
            questionInputRef.current?.focus();
        }
    }, [isEditing]);

    // Esitystilasta pääsee pois Esc-näppäimellä.
    // Näppäinkuuntelija on käytössä vain esitystilan aikana.
    useEffect(() => {
        if (!isPresenting) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsPresenting(false);
                presentationButtonRef.current?.focus();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        // Poistetaan kuuntelija, kun esitystila päättyy tai komponentti poistuu.
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPresenting]);

    // Suljetaan muokkaus ja palautetaan kohdistus Edit question -painikkeeseen.
    function finishEditing() {
        setIsEditing(false);

        // Painike tulee takaisin näkyviin muokkaustilan sulkeuduttua.
        // Kohdistuksen siirtoa lykätään seuraavaan animaatiokehykseen.
        requestAnimationFrame(() => {
            editButtonRef.current?.focus();
        });
    }

    // Tallennetaan muokattu kysymys vain tämän näkymän paikalliseen tilaan.
    // Tässä ei tehdä backend-kutsua tai tietokantatallennusta.
    function saveQuestion(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextQuestion = draftQuestion.trim();

        // Estetään myös pelkistä välilyönneistä koostuva kysymys.
        if (!nextQuestion) return;

        setQuestion(nextQuestion);
        finishEditing();
    }

    // Hylätään luonnos ja palautetaan kenttään aiemmin tallennettu kysymys.
    function cancelEditing() {
        setDraftQuestion(question);
        finishEditing();
    }

    return (
        <main className="min-h-dvh bg-tumma px-4 py-6 text-white sm:px-8 sm:py-10">
            <div className="mx-auto w-full max-w-6xl">
                {/* Työkalun nimi ja tieto siitä, että käytössä on testidata. */}
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-2xl font-black tracking-tight text-vaalea">
            MP-Tool
          </span>

                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Test data · not connected to a session
          </span>
                </header>

                {/* Kysymys toimii koko tulosalueen saavutettavana otsikkona. */}
                <section
                    aria-labelledby="mp-question"
                    className="overflow-hidden rounded-3xl border border-white/15 bg-paavari shadow-2xl shadow-black/20"
                >
                    {/* Yläosa: kysymys, sen muokkaus ja esitystilapainike. */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
                        <div className="min-w-0 flex-1 basis-64">
                            <h1
                                id="mp-question"
                                className="break-words text-xl leading-relaxed font-bold sm:text-2xl"
                            >
                                {question}
                            </h1>

                            {/* Muokkauspainike piilotetaan muokkauksen ja esitystilan ajaksi. */}
                            {!isPresenting && !isEditing && (
                                <button
                                    ref={editButtonRef}
                                    type="button"
                                    className={`${secondaryButton} mt-3`}
                                    onClick={() => {
                                        setDraftQuestion(question);
                                        setIsEditing(true);
                                    }}
                                >
                                    Edit question
                                </button>
                            )}

                            {/* Muokkauslomake näkyy vain normaalinäkymässä. */}
                            {!isPresenting && isEditing && (
                                <form onSubmit={saveQuestion} className="mt-4">
                                    <label
                                        htmlFor="mp-question-input"
                                        className="mb-2 block text-sm text-white/80"
                                    >
                                        Question
                                    </label>

                                    <input
                                        ref={questionInputRef}
                                        id="mp-question-input"
                                        value={draftQuestion}
                                        onChange={(event) =>
                                            setDraftQuestion(event.target.value)
                                        }
                                        maxLength={180}
                                        required
                                        className="min-h-12 w-full rounded-xl border border-white/30 bg-tumma px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                                    />

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="submit"
                                            disabled={!draftQuestion.trim()}
                                            className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                            Save question
                                        </button>

                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className={secondaryButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-white/60">
                                        Preview only. Changes reset when the page is reloaded.
                                    </p>
                                </form>
                            )}
                        </div>

                        {/* Painike säilyy näkyvissä myös esitystilassa, jotta siitä pääsee pois.
                aria-pressed välittää esitystilan tilan avustaville teknologioille. */}
                        <button
                            ref={presentationButtonRef}
                            type="button"
                            aria-pressed={isPresenting}
                            onClick={() => setIsPresenting((current) => !current)}
                            className={`${secondaryButton} shrink-0`}
                        >
                            {isPresenting
                                ? 'Exit presentation view'
                                : 'Presentation view'}
                        </button>
                    </div>

                    {/* Normaalitilassa sivupaneeli on leveällä näytöllä tulosten vieressä.
              Kapeassa näkymässä se siirtyy alle.
              Esitystilassa tulokset käyttävät koko leveyden. */}
                    <div
                        className={
                            isPresenting
                                ? 'grid grid-cols-1'
                                : 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem]'
                        }
                    >
                        <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                            {/* Yhteenveto näkyy myös silloin, kun vastausjakauma on piilotettu. */}
                            <div className="py-5 text-center sm:py-7">
                                <p className="text-sm font-bold text-white/80">
                                    Average vote
                                </p>

                                <p className="mt-2 text-7xl leading-none font-black tracking-tight text-yellow-300 tabular-nums sm:text-8xl">
                                    {average === null ? '–' : average.toFixed(1)}
                                </p>

                                <p className="mt-5 text-sm text-white/75">
                                    {total === 0
                                        ? 'No responses yet'
                                        : `${total} responses · scale 1–5`}
                                </p>
                            </div>

                            {/* Keskiarvon visuaalinen sijainti asteikolla 1–5.
                  Tämä on tekstiyhteenvedon rinnakkainen esitys, joten se
                  piilotetaan ruudunlukijoilta aria-hidden-ominaisuudella. */}
                            <div className="mb-7 px-3" aria-hidden="true">
                                <div className="relative h-6">
                                    <div className="absolute inset-x-0 top-3 h-px bg-white/25" />

                                    {average !== null && (
                                        <span
                                            style={{
                                                // Muunnetaan asteikko 1–5 sijainniksi 0–100 %.
                                                left: `${((average - 1) / 4) * 100}%`,
                                            }}
                                            className="absolute top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-paavari bg-yellow-300 ring-1 ring-yellow-300"
                                        />
                                    )}
                                </div>

                                {/* Numerot sijoitetaan samalle asteikolle keskiarvomerkin kanssa. */}
                                <div className="relative h-5 text-xs text-white/70">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <span
                                            key={value}
                                            style={{
                                                left: `${((value - 1) / 4) * 100}%`,
                                            }}
                                            className="absolute -translate-x-1/2"
                                        >
                      {value}
                    </span>
                                    ))}
                                </div>
                            </div>

                            {/* Jakauman näkyvyys säilyy samana esitystilaa vaihdettaessa. */}
                            {/* Asteikon päiden merkitys näkyy myös esitystilassa.
    Selitykset ovat aria-hidden-asteikon ulkopuolella,
    jotta ne ovat saatavilla myös avustaville teknologioille. */}
                            <div className="mb-7 grid grid-cols-2 gap-6 text-sm text-white/75">
                                <p className="min-w-0 break-words">
                                    <span className="font-bold text-white">1</span>
                                    {' = '}
                                    {lowLabel}
                                </p>

                                <p className="min-w-0 text-right break-words">
                                    <span className="font-bold text-white">5</span>
                                    {' = '}
                                    {highLabel}
                                </p>
                            </div>
                            {showResults ? (
                                <div id="mp-distribution">
                                    <h2 className="mb-2 text-lg font-bold">
                                        Response distribution
                                    </h2>

                                    <p className="mb-5 text-sm text-white/65">
                                        Bar length shows share of all responses, from 0–100%.
                                    </p>

                                    <ul className="space-y-4">
                                        {counts.map((count, index) => {
                                            // Pylvään leveys kuvaa osuutta kaikista vastauksista.
                                            // Nollan vastauksen tilanteessa vältetään nollalla jako.
                                            const percentage =
                                                total > 0 ? (count / total) * 100 : 0;

                                            return (
                                                <li key={index}>
                                                    {/* Määrä ja osuus esitetään tekstinäkin:
                              tieto ei riipu pelkästä pylväästä tai väristä. */}
                                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-bold">
                              Rating {index + 1}
                            </span>

                                                        <span className="text-white/80 tabular-nums">
                              {count} responses · {percentage.toFixed(0)}%
                            </span>
                                                    </div>

                                                    {/* Taustapalkki vastaa 100 %:a.
                              Värillinen osa vastaa tämän vaihtoehdon osuutta. */}
                                                    <div
                                                        aria-hidden="true"
                                                        className="h-9 overflow-hidden rounded-lg border border-white/10 bg-tumma/60"
                                                    >
                                                        <div
                                                            style={{ width: `${percentage}%` }}
                                                            className={`h-full rounded-lg ${barColors[index]} transition-[width] duration-300 ease-out motion-reduce:transition-none`}
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/65">
                                    Response distribution is hidden.
                                    {!isPresenting && ' Use “Show vote counts” to display it.'}
                                </p>
                            )}
                        </div>

                        {/* Liittymisalue ja hallintapainike poistuvat esitystilassa. */}
                        {!isPresenting && (
                            <aside
                                aria-label="Presenter controls"
                                className="border-t border-white/10 bg-white/5 p-5 sm:p-7 lg:border-t-0 lg:border-l"
                            >
                                <h2 className="text-lg font-bold">Join session</h2>

                                {/* QR-koodin paikkamerkki.
                    Korvataan oikealla QR-koodilla session integraatiossa. */}
                                <div className="mt-5 flex aspect-square max-w-48 items-center justify-center rounded-2xl border border-dashed border-white/30 bg-tumma/40 p-5 text-center text-sm text-white/65">
                                    QR code will appear when a real session is connected.
                                </div>

                                <p className="mt-4 text-sm text-white/65">
                                    No active join code in this preview.
                                </p>

                                {/* Tämä painike muuttaa vain jakauman näkyvyyttä.
                    Se ei muuta vastausaineistoa tai keskiarvoa. */}
                                <button
                                    type="button"
                                    onClick={() => setShowResults((current) => !current)}
                                    aria-expanded={showResults}
                                    className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-magenta px-4 py-3 text-center text-sm leading-snug font-bold text-white transition-colors duration-150 hover:bg-magenta-tumma focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transition-none"
                                >
                                    {showResults ? 'Hide vote counts' : 'Show vote counts'}
                                </button>

                                <p className="mt-4 text-xs leading-relaxed text-white/60">
                                    Question editing and display settings are local to this
                                    preview. No data is saved.
                                </p>
                            </aside>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
