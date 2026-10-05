'use client';
import Form from 'next/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const handleSessionStart = async () => {
    if (!name.trim()) {
      console.error('Subject is required');
      return;
    }
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name }),
    });
    const data = await response.json();

    router.push(`/host/${data.id}`);
  };
  return (
    <main className="flex flex-1 w-full h-full flex-col items-center bg-tumma">
      <h1 className="text-4xl font-bold my-8 text-magenta mb-16">WordCloud</h1>
      <div className="text-white flex flex-col items-center justify-center mb-8 gap-2">
        <h2 className="text-2xl font-bold">Create a session</h2>
        <p>Give your session a topic to get started</p>
      </div>
      <Form
        action={handleSessionStart}
        className="flex flex-col gap-4 w-2/5 items-center">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=" py-2 px-4 mb-6 rounded-lg text-white bg-[#000026]/50 font-md text-center  w-full"
        />
        <button
          type="submit"
          className="py-2 px-4 font-semibold bg-magenta text-zinc-200 rounded-xl hover:bg-[#3CD4D0] hover:cursor-pointer w-1/3 flex flex-row justify-center items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 33V2L30 17.5L2 33Z"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Start
        </button>
      </Form>
    </main>
  );
}
