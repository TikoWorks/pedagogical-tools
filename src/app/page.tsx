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
    <main className="flex flex-1 w-full h-full flex-col items-center">
      <h1 className="text-4xl font-semibold my-8">WordCloud</h1>
      <Form action={handleSessionStart} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject"
          className="border border-zinc-300 py-2 px-4 rounded-sm"
        />
        <button
          type="submit"
          className="py-2 px-4 font-semibold bg-zinc-800 text-zinc-200 rounded-4xl hover:bg-zinc-700 hover:cursor-pointer">
          Start session
        </button>
      </Form>
    </main>
  );
}
