'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import SubmissionForm from '@/components/join/SubmissionForm';
import SendingView from '@/components/join/SendingView';
import SuccessView from '@/components/join/SuccessView';

type Status = 'input' | 'sending' | 'success';

export default function UserPage() {
  const [inputWord, setInputWord] = useState('');
  const [participantId, setParticipantID] = useState('');
  const [status, setStatus] = useState<Status>('input');
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const { joinCode } = useParams<{ joinCode: string }>();

  // Osallistujan luominen
  useEffect(() => {
    if (!joinCode) return;

    let channel: ReturnType<typeof supabase.channel> | undefined;
    let cancelled = false;

    async function addParticipant() {
      try {
        const response = await fetch('/api/participant/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ joinCode }),
        });

        if (!response.ok) {
          throw new Error('Failed to add participant');
        }

        const data = await response.json();

        if (cancelled) return;

        setParticipantID(data.id);
        setIsPaused(data.state === 'paused');
        setIsEnded(data.state === 'ended');

        // Realtime kuuntelu state tilalle
        channel = supabase
          .channel(`session:${data.sessionId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'session',
              filter: `id=eq.${data.sessionId}`,
            },
            (payload) => {
              setIsPaused(payload.new.state === 'paused');
              setIsEnded(payload.new.state === 'ended');
            },
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'session',
            },
            (payload) => {
              if (payload.old.id === data.sessionId) {
                setIsEnded(true);
              }
            },
          )
          .subscribe();
      } catch (error) {
        if (cancelled) return;

        console.error('addParticipant error:', error);
        setError(
          'Unable to join the game. Please try scanning the QR code again.',
        );
      }
    }

    void addParticipant();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [joinCode]);

  // Sanan lähettäminen
  async function handleAdd(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!inputWord.trim() || !participantId) return;

    setError('');
    setStatus('sending');

    try {
      const response = await fetch('/api/submission/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { word: inputWord.trim() },
          participantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send word');
      }

      setInputWord('');
      setStatus('success');
    } catch (error) {
      console.error('handleAdd error:', error);
      setError('Failed to send word. Please try again.');
      setStatus('input');
    }
  }

  return (
    <main className="bg-paavari flex h-dvh w-full flex-col items-center overflow-hidden">
      {isEnded ? (
        <div className="flex h-full items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Game ended</h1>
        </div>
      ) : (
        <>
          {status === 'input' && (
            <SubmissionForm
              inputWord={inputWord}
              onWordChange={setInputWord}
              onSubmit={handleAdd}
              participantId={participantId}
              error={error}
              isPaused={isPaused}
            />
          )}

          {status === 'sending' && <SendingView />}

          {status === 'success' && (
            <SuccessView onAddNewWord={() => setStatus('input')} />
          )}
        </>
      )}
    </main>
  );
}
