'use client';
import Form from 'next/form';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'input' | 'sending' | 'success';

export default function UserPage() {
  const [inputWord, setInputWord] = useState('');
  const [participantId, setParticipantID] = useState('');
  const [status, setStatus] = useState<Status>('input');

  // join_code haku URL:ista
  const searchParams = useSearchParams();
  const joinCode = searchParams.get('join_code');

  // uuden käyttäjän lisäys & participantId:n haku
  useEffect(() => {
    if (!joinCode) {
      console.error('joinCode missing');
      return;
    }
    async function addParticipant() {
      try {
        const response = await fetch('/api/participant/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: joinCode }),
        });
        const data = await response.json();
        setParticipantID(data.id);
      } catch (error) {
        console.error('addParticipant error: ', error);
        throw error;
      }
    }
    addParticipant();
    // useEffect ajetaan ensimmäisellä renderöinnillä ja jos joinCode muuttuu
  }, [joinCode]);

  // Sanan lisäys
  async function handleAdd() {
    if (!inputWord.trim() || inputWord.trim() === '') {
      console.error('inputWord missing');
      return;
    }

    // Näytetään "sending..." näkymä
    setStatus('sending');

    try {
      const response = await fetch('/api/submission/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inputWord, participantId: participantId }),
      });
      const data = await response.json();

      // Näytetään "word sent" näkymä 2 sekunttia, ja palataan input näkymään
      setStatus('success');
      setTimeout(() => {
        setInputWord('');
        setStatus('input');
      }, 2000);
      return data;
    } catch (error) {
      console.error('handleAdd error: ', error);

      // Palautetaan input näkymä, jos lähetys epäonnistui
      setStatus('input');
    }
  }

  return (
    <main className="bg-[#0D004C] flex flex-1 w-full flex-col items-center">
      <h1 className="text-[#E2066F] text-4xl font-semibold mt-12 mb-28">
        WordCloud
      </h1>

      {/* Käyttäjän input */}
      {status === 'input' && (
        <Form action={handleAdd} className="flex flex-col gap-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Type here..."
              maxLength={25}
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              className="bg-white py-3 px-4 pr-10 rounded-2xl w-80"
            />
            <div className="text-white flex items-center justify-center mt-2">
              {inputWord.length}/25 characters
            </div>

            {/* Inputin tyhjennysraksi */}
            {inputWord && (
              <button
                type="button"
                onClick={() => setInputWord('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                aria-label="Clear input">
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputWord.trim()}
            className="bg-[#E2066F] text-white font-semibold py-3 px-2 rounded-xl disabled:bg-gray-500">
            Send
          </button>
        </Form>
      )}
      {status === 'sending' && (
        <div className="text-white">
          <h1 className="text-4xl">Sending...</h1>
          <p>Word is being added to WordCloud</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-4xl text-white">Word sent!</div>
      )}
    </main>
  );
}
