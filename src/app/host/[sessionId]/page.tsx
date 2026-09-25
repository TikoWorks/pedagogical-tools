'use client';
import { useEffect, useState } from 'react';

type Session = {
  id: string;
  name: string;
  join_code: string;
  state: 'active' | 'paused';
};

export default function HostPage() {
  // Sessionin datan muuttuja
  const [sessionData, setSessionData] = useState<Session | null>(null);

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

    getSessionData();

    // Funktio ajetaan komponentin alustuksessa, ja silloin jos sessionId muuttuu
  }, []);

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
          onClick={() => setShowQR(false)}>
          <div
            className="w-80 h-80 rounded-xl bg-white flex flex-col items-center justify-center shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">
              Join {sessionData.name}
            </h2>
            <div className="w-48 h-48 bg-zinc-200 flex items-center justify-center">
              <span className="text-zinc-600">{sessionData.join_code}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
