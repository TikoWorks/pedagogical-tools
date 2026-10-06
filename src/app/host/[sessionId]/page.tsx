'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import HostGameHeader from '@/components/host/HostGameHeader';
import HostGameFooter from '@/components/host/HostGameFooter';
import WordCloud from '@/components/host/WordCloud';
import type { Session, Submission } from '@/types';

type RawSubmission = {
  data: {
    word: string;
  };
};

export default function HostPage() {
  // Sessionin datan muuttuja
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [submissionsData, setSubmissionsData] = useState<Submission[]>([]);
  const [sessionName, setSessionName] = useState('');

  // Session datan haku
  useEffect(() => {
    async function getSessionData() {
      try {
        const response = await fetch(`/api/session/`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch session: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        setSessionData(data);
        setSessionName(data.name);
      } catch (error) {
        console.error('getSessionData error: ', error);
        throw error;
      }
    }

    getSessionData();

    // Funktio ajetaan komponentin alustuksessa
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
        console.error('getSubmissionsData error: ', error);
        throw error;
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

  if (!sessionData) {
    return <div>Loading...</div>;
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
          name,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update session: ${response.status} ${response.statusText}`,
        );
      }

      const updatedSession = await response.json();
      setSessionData(updatedSession);
    } catch (error) {
      console.error('updateSessionName error: ', error);
    }
  }

  //Submissioneiden poistaminen
  async function resetSubmissions() {
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
    } catch (error) {
      console.error('resetSubmissions error:', error);
    }
  }

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden px-20">
      <div className="absolute -inset-[2px] bg-[url('/images/host_background.svg')] bg-[length:100%_100%] bg-no-repeat" />

      <HostGameHeader joinUrl={joinUrl} sessionName={sessionName} />

      {submissionsData.length === 0 ? (
        <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-6 pb-24">
          <Image src="/images/cloud.svg" alt="" width={200} height={200} />
          <h2 className="text-[3rem] font-bold text-white">No words yet</h2>
        </section>
      ) : (
        <section className="relative z-10 min-h-0 flex-1">
          <WordCloud submissions={submissionsData} />
        </section>
      )}
      <HostGameFooter
        sessionName={sessionName}
        onSessionNameChange={setSessionName}
        onSessionNameSave={updateSessionName}
        onReset={resetSubmissions}
      />
    </main>
  );
}
