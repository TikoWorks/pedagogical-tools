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

        console.log('Session ID:', data.sessionId);
        console.log('Initial state:', data.state);
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
              console.log('Realtime payload:', payload);
              console.log('New session state:', payload.new.state);

              setIsPaused(payload.new.state === 'paused');
            },
          )
          .subscribe((status, err) => {
            console.log('Realtime status:', status);

            if (err) {
              console.error('Realtime error:', err);
            }
          });
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

  useEffect(() => {
    console.log('UserPage isPaused:', isPaused);
  }, [isPaused]);

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
    </main>
  );
}
