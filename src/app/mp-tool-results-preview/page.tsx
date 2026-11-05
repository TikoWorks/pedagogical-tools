'use client';

import { useState } from 'react';
import MpToolResultsView from '@/components/mp-tool/MpToolResultsView';

// Kaikki aineistot ovat vain esikatselun testaamista varten.
const testCases = [
    {
        label: 'Vaihteleva jakauma — 20 vastausta, keskiarvo 3,2',
        counts: [2, 3, 6, 7, 2],
    },
    {
        label: 'Ei vastauksia — keskiarvo puuttuu',
        counts: [0, 0, 0, 0, 0],
    },
    {
        label: 'Kaikki vastaukset 1 — keskiarvo 1,0',
        counts: [10, 0, 0, 0, 0],
    },
    {
        label: 'Kaikki vastaukset 5 — keskiarvo 5,0',
        counts: [0, 0, 0, 0, 10],
    },
    {
        label: 'Tasainen jakauma — 10 vastausta, keskiarvo 3,0',
        counts: [2, 2, 2, 2, 2],
    },
] as const;

export default function MpToolResultsPreviewPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedCase = testCases[selectedIndex] ?? testCases[0];

    return (
        <>
            {/* Kehityksen testivalitsin, ei lopullisen opettajanäkymän toiminto. */}
            <aside
                aria-label="Testiaineiston valinta"
                className="border-b border-white/15 bg-tumma px-4 py-4 text-white"
            >
                <div className="mx-auto max-w-6xl">
                    <label
                        htmlFor="mp-test-data"
                        className="mb-2 block text-sm font-bold"
                    >
                        Esikatselun testiaineisto
                    </label>

                    <select
                        id="mp-test-data"
                        value={selectedIndex}
                        onChange={(event) =>
                            setSelectedIndex(Number(event.target.value))
                        }
                        className="min-h-12 w-full max-w-xl rounded-xl border border-white/30 bg-paavari px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                    >
                        {testCases.map((testCase, index) => (
                            <option key={testCase.label} value={index}>
                                {testCase.label}
                            </option>
                        ))}
                    </select>
                </div>
            </aside>

            <MpToolResultsView
                initialQuestion="How confident do you feel today?"
                lowLabel="Not at all confident"
                highLabel="Very confident"
                counts={selectedCase.counts}
            />
        </>
    );
}
