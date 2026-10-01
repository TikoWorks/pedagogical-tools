'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import HostLobbyView from '@/components/host/HostLobbyView';
import HostGameView from '@/components/host/HostGameView';
import type { Submission } from '@/types/submission';

type Session = {
  id: string;
  name: string;
  join_code: string;
  state: 'active' | 'paused';
};

type RawSubmission = {
  data: {
    word: string;
  };
};

// Sanapilvi sanojen värit
const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444'];

function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export default function HostPage() {
  // Sessionin datan muuttuja
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [submissionsData, setSubmissionsData] = useState<Submission[]>([]);

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
      } catch (error) {
        console.error('getSessionData error: ', error);
        throw error;
      }
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
              color: getRandomColor(),
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
    getSessionData();

    // Funktio ajetaan komponentin alustuksessa
  }, []);

  // Realtime-kuuntelu uusille submissioneille
  useEffect(() => {
    if (!sessionData) {
      return;
    }

    const sessionId = sessionData.id;

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
                color: getRandomColor(),
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

  async function startGame() {
    try {
      const response = await fetch('/api/session', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: 'active',
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to start game: ${response.status} ${response.statusText}`,
        );
      }

      const updatedSession = await response.json();
      setSessionData(updatedSession);
    } catch (error) {
      console.error('startGame error: ', error);
    }
  }

  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join/${sessionData.join_code}`;

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <div className="absolute -inset-[2px] bg-[url('/images/host_background.svg')] bg-[length:100%_100%] bg-no-repeat" />
      {sessionData.state === 'paused' ? (
        <HostLobbyView
          sessionName={sessionData.name}
          joinUrl={joinUrl}
          onStart={startGame}
        />
      ) : (
        <HostGameView
          sessionName={sessionData.name}
          submissions={submissionsData}
        />
      )}
    </main>
  );
}
