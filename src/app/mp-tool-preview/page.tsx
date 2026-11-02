'use client';

import { useState } from 'react';
import MpToolStudentView from '@/components/mp-tool/MpToolStudentView';

export default function MpToolPreviewPage() {
    const [simulateError, setSimulateError] = useState(false);

    return (
        <>
            <aside
                aria-label="Development test settings"
                className="border-b border-slate-300 bg-slate-100 px-4 py-3 text-slate-950"
            >
                <label className="mx-auto flex max-w-sm items-center gap-3 text-sm">
                    <input
                        type="checkbox"
                        checked={simulateError}
                        onChange={(event) =>
                            setSimulateError(event.target.checked)
                        }
                        className="h-5 w-5"
                    />

                    Simulate submission error
                </label>
            </aside>

            <MpToolStudentView
                question="How confident do you feel today?"
                lowLabel="Not at all confident"
                highLabel="Very confident"
                simulateError={simulateError}
            />
        </>
    );
}
