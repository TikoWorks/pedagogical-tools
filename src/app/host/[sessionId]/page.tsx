'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

type Submission = {
  word: string;
  count: number;
};

export default function HostPage() {
  // Sessionin datan muuttuja
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [submissionsData, setSubmissionsData] = useState<Submission[]>([]);

  const [showQR, setShowQR] = useState(false);

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

  function getFontSize(count: number) {
    return Math.min(20 + count * 4, 60);
  }

  if (!sessionData) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-1 w-full h-full flex-col items-center">
      <h1 className="text-4xl font-semibold my-8">{sessionData.name}</h1>
      <button className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-4xl hover:cursor-pointer hover:bg-zinc-900">
        Show QR
      </button>
      {showQR && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-80 h-80 rounded-xl bg-white flex flex-col items-center justify-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">
              Join {sessionData.name}
            </h2>
            <div className="w-48 h-48 bg-zinc-200 flex items-center justify-center">
              <span className="text-zinc-600">{sessionData.join_code}</span>
            </div>
          </div>
        </div>
      )}
      <div>
        {submissionsData.map((submission, index) => (
          <p key={index} style={{ fontSize: getFontSize(submission.count) }}>
            {submission.word} {submission.count}
          </p>
        ))}
      </div>
    </main>
  );
}
