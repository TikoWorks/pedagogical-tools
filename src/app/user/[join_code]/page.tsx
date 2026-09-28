'use client';
import Form from 'next/form';
import { useState } from 'react';

export default function UserPage() {
  const [inputWord, setInputWord] = useState('');

  const handleAdd = () => {
    console.log('Sana: ', inputWord);
  };

  return (
    <main className="bg-[#0D004C] flex flex-1 w-full flex-col items-center">
      <h1 className="text-[#E2066F] text-4xl font-semibold mt-12 mb-28">
        WordCloud
      </h1>
      <Form action={handleAdd} className="flex flex-col gap-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Type here..."
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            className="bg-white py-3 px-4 pr-10 rounded-2xl w-80"
          />

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
    </main>
  );
}
