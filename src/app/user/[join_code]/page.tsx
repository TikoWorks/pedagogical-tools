'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

type Status = 'input' | 'sending' | 'success';

export default function UserPage() {
  const [inputWord, setInputWord] = useState('');
  const [participantId, setParticipantID] = useState('');
  const [status, setStatus] = useState<Status>('input');

  // join_code haku URL:ista
  const params = useParams();
  const joinCode = params.join_code as string;

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
          body: JSON.stringify({ joinCode }),
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
  async function handleAdd(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputWord.trim()) {
      console.error('inputWord missing');
      return;
    }

    // Näytetään "sending..." näkymä
    setStatus('sending');

    try {
      const response = await fetch('/api/submission/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { word: inputWord },
          participantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Näytetään "word sent" näkymä
      setInputWord('');
      setStatus('success');

      return data;
    } catch (error) {
      console.error('handleAdd error: ', error);

      // Palautetaan input näkymä, jos lähetys epäonnistui
      setStatus('input');
    }
  }

  return (
    <main className="bg-tumma min-h-screen flex flex-1 w-full flex-col items-center">
      {/* Käyttäjän input näkymä*/}
      {status === 'input' && (
        <div className="flex flex-1 w-full flex-col items-center">
          <h1 className="text-magenta text-4xl font-semibold mt-12 mb-28">
            WordCloud
          </h1>
          <form onSubmit={handleAdd} className="flex flex-col gap-10">
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type here..."
                  maxLength={25}
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  className="bg-white py-3 px-4 pr-10 rounded-2xl w-80"
                />
                {/* Inputin tyhjennysraksi */}
                {inputWord && (
                  <button
                    type="button"
                    onClick={() => setInputWord('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-white flex items-center justify-center">
                {inputWord.length}/25 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={!inputWord.trim()}
              className="bg-magenta text-white font-semibold py-3 px-2 rounded-xl disabled:bg-gray-500"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* "Sending..." näkymä */}
      {status === 'sending' && (
        <div className="text-white flex flex-col items-center justify-center mt-60">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce"></div>
          </div>
          <h1 className="text-2xl font-semibold mb-4 mt-12">Sending...</h1>
          <Image
            src="/images/sending.svg"
            alt=""
            width={48}
            height={48}
            className="w-12 h-12 mr-2"
          />
          <p className="text-center mt-4">Word is being added to WordCloud</p>
        </div>
      )}

      {/* "Word sent!" näkymä */}
      {status === 'success' && (
        <div className="relative text-white flex flex-1 flex-col items-center h-full">
          <Image
            src={'/images/confetti.png'}
            alt="confetti"
            width={500}
            height={500}
            className="mt-20"
          />
          <Image
            src="/images/success.svg"
            alt=""
            width={180}
            height={180}
            className="absolute left-1/2 -translate-x-1/2 top-50"
          />

          <h1 className="font-extrabold absolute left-1/2 w-3/4 text-center -translate-x-1/2 top-100 text-4xl">
            Word sent!
          </h1>
          <button
            onClick={() => setStatus('input')}
            className="mt-auto mb-28 bg-magenta px-8 py-4 rounded-2xl w-3/4 text-white text-2xl font-bold"
          >
            Add new word
          </button>
        </div>
      )}
    </main>
  );
}
