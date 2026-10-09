'use client';
import Button from '@/components/host/Button';
import SessionNameInput from '@/components/host/SessionNameInput';
import Image from 'next/image';
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
    <main className="flex flex-1 w-full h-full flex-col items-center bg-paavari">
      <h1 className="text-4xl font-bold my-8 text-magenta mb-16">WordCloud</h1>
      <div className="text-white flex flex-col items-center justify-center mb-8 gap-2">
        <h2 className="text-2xl font-bold">Create a session</h2>
        <p>Give your session a topic to get started</p>
      </div>
      <Form
        action={handleSessionStart}
        className="flex flex-col gap-4 w-2/5 items-center">
        <SessionNameInput sessionName={name} onSessionNameChange={setName} />
        <Button
          type="submit"
          onClick={() => {}}
          className="bg-magenta min-w-40 w-2/3 hover:bg-[#625BC4] hover:cursor-pointer">
          <Image src="/images/start.svg" alt="start" width={20} height={20} />
          Start
        </Button>
      </Form>
    </main>
  );
}
