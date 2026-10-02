'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

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
        body: JSON.stringify({ data: inputWord, participantId: participantId }),
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
    <main className="bg-[#0D004C] min-h-screen flex flex-1 w-full flex-col items-center">
      {/* Käyttäjän input näkymä*/}
      {status === 'input' && (
        <div className="flex flex-1 w-full flex-col items-center">
          <h1 className="text-[#E2066F] text-4xl font-semibold mt-12 mb-28">
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
                    aria-label="Clear input">
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
              className="bg-[#E2066F] text-white font-semibold py-3 px-2 rounded-xl disabled:bg-gray-500">
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
          <svg
            className="w-12 h-12 mr-2"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M63.2095 0.589766C63.4907 0.871428 63.683 1.22951 63.7624 1.61952C63.8419 2.00953 63.805 2.41429 63.6563 2.78352L40.0167 61.8807C39.8083 62.4011 39.4605 62.854 39.0113 63.1895C38.5622 63.525 38.0292 63.7301 37.471 63.7821C36.9129 63.8342 36.3511 63.7313 35.8477 63.4847C35.3443 63.2381 34.9186 62.8574 34.6176 62.3845L21.707 42.0923L1.41478 29.1816C0.94076 28.8809 0.559022 28.4551 0.31169 27.9512C0.0643585 27.4473 -0.0389522 26.8848 0.013158 26.3259C0.0652683 25.767 0.270774 25.2333 0.606998 24.7838C0.943222 24.3343 1.39709 23.9864 1.91853 23.7785L61.0157 0.146954C61.3849 -0.00168405 61.7897 -0.0385704 62.1797 0.0408765C62.5697 0.120324 62.9278 0.312603 63.2095 0.593829V0.589766ZM25.7613 40.906L36.9779 58.5291L56.2057 10.4616L25.7613 40.906ZM53.3335 7.58945L5.26603 26.8173L22.8932 38.0298L53.3335 7.58945Z"
              fill="white"
            />
          </svg>

          <p className="text-center mt-4">Word is being added to WordCloud</p>
        </div>
      )}

      {/* "Word sent!" näkymä */}
      {status === 'success' && (
        <div className="relative text-white flex flex-1 flex-col items-center h-full">
          <Image
            src={'/confetti.png'}
            alt="confetti"
            width={500}
            height={500}
            className="mt-20"></Image>
          <svg
            width="222"
            height="222"
            viewBox="0 0 222 222"
            fill="none"
            className="absolute left-1/2 -translate-x-1/2 top-44"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M111 203.5C136.543 203.5 159.668 193.146 176.407 176.407C193.146 159.668 203.5 136.543 203.5 111C203.5 85.457 193.146 62.332 176.407 45.5926C159.668 28.8534 136.543 18.5 111 18.5C85.457 18.5 62.332 28.8534 45.5926 45.5926C28.8534 62.332 18.5 85.457 18.5 111C18.5 136.543 28.8534 159.668 45.5926 176.407C62.332 193.146 85.457 203.5 111 203.5Z"
              fill="#625BC4"
            />
            <path
              d="M74 111L101.75 138.75L157.25 83.25"
              stroke="white"
              strokeWidth="15"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <h1 className="font-extrabold absolute left-1/2 w-3/4 text-center -translate-x-1/2 top-100 text-4xl">
            Word sent!
          </h1>
          <button
            onClick={() => setStatus('input')}
            className="mt-auto mb-28 bg-[#E2066F] px-8 py-4 rounded-2xl w-3/4 text-white text-2xl font-bold">
            Add new word
          </button>
        </div>
      )}
    </main>
  );
}
