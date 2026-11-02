'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

type Rating = 1 | 2 | 3 | 4 | 5;
type Status = 'input' | 'sending' | 'success';

type MpToolStudentViewProps = {
    question: string;
    lowLabel: string;
    highLabel: string;
    simulateError?: boolean;
};

const ratings: Rating[] = [1, 2, 3, 4, 5];

export default function MpToolStudentView({
                                              question,
                                              lowLabel,
                                              highLabel,
                                              simulateError = false,
                                          }: MpToolStudentViewProps) {
    const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
    const [submittedRating, setSubmittedRating] = useState<Rating | null>(null);
    const [status, setStatus] = useState<Status>('input');
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (selectedRating === null || status !== 'input') return;

        const ratingToSubmit = selectedRating;
        const shouldFail = simulateError;

        setError('');
        setStatus('sending');

        try {
            // Vain testilähetys. Ei verkkokutsua tai tallennusta.
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 600);
            });

            if (shouldFail) {
                throw new Error('Simulated submission failure');
            }

            setSubmittedRating(ratingToSubmit);
            setStatus('success');
        } catch {
            setError(
                'Test submission failed. Your selection was kept. Please try again.',
            );
            setStatus('input');
        }
    }

    const isSending = status === 'sending';
    const isSuccess = status === 'success';

    return (
        <main className="min-h-dvh bg-white px-4 py-6 text-slate-950">
            <div className="mx-auto w-full max-w-sm">
                <header className="mb-6 flex items-center justify-between">
                    <span className="text-xl font-bold">MP</span>
                    <span className="text-xs text-slate-600">Test preview</span>
                </header>

                <form onSubmit={handleSubmit}>
                    <fieldset disabled={isSending || isSuccess} className="min-w-0">
                        <legend className="mb-4 w-full rounded-xl bg-[#100538] p-5 text-xl font-bold text-white">
                            {question}
                        </legend>

                        <p id="rating-help" className="mb-4 text-sm text-slate-700">
                            Pick one number from 1 to 5.
                        </p>

                        <div
                            className="grid grid-cols-5 gap-2"
                            aria-describedby="rating-help rating-scale"
                        >
                            {ratings.map((rating) => (
                                <label key={rating} className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mp-rating"
                                        value={rating}
                                        checked={selectedRating === rating}
                                        onChange={() => setSelectedRating(rating)}
                                        className="peer h-5 w-5"
                                        required
                                    />

                                    <span className="flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-400 bg-white text-lg peer-checked:border-slate-950 peer-checked:bg-yellow-400 peer-checked:font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-blue-700">
                    {rating}
                  </span>
                                </label>
                            ))}
                        </div>

                        <div
                            id="rating-scale"
                            className="mt-3 flex justify-between gap-4 text-xs text-slate-700"
                        >
                            <span className="max-w-[45%]">1 = {lowLabel}</span>
                            <span className="max-w-[45%] text-right">
                5 = {highLabel}
              </span>
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={selectedRating === null || status !== 'input'}
                        className="mt-6 min-h-12 w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
                    >
                        {isSending
                            ? 'Sending…'
                            : isSuccess
                                ? 'Test vote sent'
                                : 'Submit vote'}
                    </button>
                </form>

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-950"
                    >
                        {error}
                    </p>
                )}

                <div role="status" aria-live="polite" className="mt-4">
                    {isSending && (
                        <p className="text-sm text-slate-700">
                            Simulating submission…
                        </p>
                    )}

                    {isSuccess && (
                        <p className="rounded-lg border border-emerald-700 bg-emerald-50 p-3 text-sm text-emerald-950">
                            Test submission completed. Selected value: {submittedRating}.
                            Nothing was saved to the database.
                        </p>
                    )}
                </div>

                <p className="mt-6 text-xs text-slate-600">
                    Development preview: no session connection or real submission.
                </p>
            </div>
        </main>
    );
}
