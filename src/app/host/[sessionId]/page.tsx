'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import HostGameHeader from '@/components/host/HostGameHeader';
import HostGameFooter from '@/components/host/HostGameFooter';
import WordCloud from '@/components/host/WordCloud';
import ResetConfirmation from '@/components/host/ResetConfirmation';
import LoadingMessage from '@/components/ui/LoadingMessage';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import type { Session, Submission } from '@/types';

type RawSubmission = {
  data: {
    word: string;
  };
};

export default function HostPage() {
  // Session
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState('');

  // Submissions
  const [submissionsData, setSubmissionsData] = useState<Submission[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);
  const [wordsError, setWordsError] = useState('');

  // Session name päivitys
  const [sessionName, setSessionName] = useState('');
  const [sessionNameDraft, setSessionNameDraft] = useState('');

  // Reset
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  // Session datan haku
  useEffect(() => {
    async function getSessionData() {
      try {
        const response = await fetch('/api/session');

        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();

        setSessionData(data);
        setSessionName(data.name);
        setSessionNameDraft(data.name);
      } catch (error) {
        console.error('getSessionData error:', error);
        setSessionError('Could not load session. Please try again.');
      } finally {
        setIsLoadingSession(false);
      }
    }

    void getSessionData();
  }, []);

  useEffect(() => {
    if (!sessionData) {
      return;
    }

    // Haetaan submissionit kannasta
    async function getSubmissionsData() {
      try {
        const response = await fetch(`/api/submission/`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch submissions: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const grouped: Submission[] = [];

        data.forEach((submission: RawSubmission) => {
          //normalisointi
          const word = submission.data.word.trim().toLowerCase();

          // Tarkistetaan, onko sana jo lisätty
          const existing = grouped.find((item) => item.word === word);

          if (existing) {
            existing.count += 1;
          } else {
            grouped.push({
              word,
              count: 1,
            });
          }
        });

        setSubmissionsData(grouped);
      } catch (error) {
        console.error('getSubmissionsData error:', error);
        setWordsError('Could not load words. Please try again.');
      } finally {
        setIsLoadingWords(false);
      }
    }

    getSubmissionsData();

    const sessionId = sessionData.id;

    // Realtime-kuuntelu uusille submissioneille
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submission',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          //normalisointi
          const word = payload.new.data.word.trim().toLowerCase();

          setSubmissionsData((current) => {
            // Tarkistetaan, onko sana jo sanapilvessä
            const existing = current.find((item) => item.word === word);

            // Jos sana löytyy, kasvatetaan sen määrää yhdellä
            if (existing) {
              return current.map((item) =>
                item.word === word ? { ...item, count: item.count + 1 } : item,
              );
            }
            //lisätään uusi sana ensimmäistä kertaa
            return [
              ...current,
              {
                word,
                count: 1,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionData]);

  if (isLoadingSession) {
    return (
      <main className="flex h-dvh items-center justify-center bg-tumma">
        <LoadingMessage
          message="Loading session..."
          className="text-[1.5rem]"
        />
      </main>
    );
  }

  if (sessionError || !sessionData) {
    return (
      <main className="flex h-dvh flex-col items-center justify-center gap-6 bg-tumma">
        <ErrorMessage
          message={sessionError || 'Session not found.'}
          className="text-[1.5rem]"
        />

        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="w-40 bg-magenta hover:bg-[#AA0045]"
        >
          Try again
        </Button>
      </main>
    );
  }

  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${sessionData.join_code}`;

  // Session nimen vaihto
  async function updateSessionName(name: string) {
    try {
      const response = await fetch('/api/session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update session: ${response.status} ${response.statusText}`,
        );
      }

      const updatedSession = await response.json();
      setSessionData(updatedSession);
      setSessionName(updatedSession.name);
      setSessionNameDraft(updatedSession.name);
    } catch (error) {
      console.error('updateSessionName error: ', error);
    }
  }

  //Submissioneiden poistaminen
  async function resetSubmissions() {
    if (isResetting) return;

    setIsResetting(true);
    setResetError('');

    try {
      const response = await fetch('/api/submission', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete submissions: ${response.status} ${response.statusText}`,
        );
      }

      setSubmissionsData([]);
      setShowResetConfirmation(false);
    } catch (error) {
      console.error('resetSubmissions error:', error);
      setResetError('Could not reset word cloud. Please try again.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden">
      <div className="absolute -inset-0.5 bg-[url('/images/host_background.svg')] bg-size-[100%_100%] bg-no-repeat" />

      {showResetConfirmation && (
        <ResetConfirmation
          onCancel={() => {
            setResetError('');
            setShowResetConfirmation(false);
          }}
          onReset={resetSubmissions}
          isResetting={isResetting}
          resetError={resetError}
        />
      )}
      <HostGameHeader joinUrl={joinUrl} sessionName={sessionName} />
      {isLoadingWords ? (
        <section className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
          <LoadingMessage
            message="Loading words..."
            className="text-[1.5rem]"
          />
        </section>
      ) : wordsError ? (
        <section className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
          <ErrorMessage message={wordsError} className="text-[1.5rem]" />
        </section>
      ) : submissionsData.length === 0 ? (
        <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center 2xl:gap-6 2xl:pb-24">
          <Image
            className="h-40 w-40"
            src="/images/cloud.svg"
            alt=""
            width={200}
            height={200}
          />
          <h2 className="text-[2rem] font-bold text-white 2xl:text-[3rem]">
            No words yet
          </h2>
        </section>
      ) : (
        <section className="relative z-10 min-h-0 flex-1">
          <WordCloud submissions={submissionsData} />
        </section>
      )}
      <HostGameFooter
        sessionName={sessionNameDraft}
        onSessionNameChange={setSessionNameDraft}
        onSessionNameSave={updateSessionName}
        onReset={() => setShowResetConfirmation(true)}
      />
    </main>
  );
}
