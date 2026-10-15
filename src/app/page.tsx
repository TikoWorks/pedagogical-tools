'use client';
import Button from '@/components/host/Button';
import SessionNameInput from '@/components/host/SessionNameInput';
import Image from 'next/image';
import Form from 'next/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import HostHeader from '@/components/host/HostHeader';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const handleSessionStart = async () => {
    if (!name.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      router.push(`/host/${data.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };
  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden">
      <div className="absolute -inset-0.5 bg-[url('/images/host_background.svg')] bg-size-[100%_100%] bg-no-repeat" />

      <div className="relative z-10 flex flex-1 flex-col items-center mt-15">
        <HostHeader />

        <div className="flex flex-col items-center justify-center text-white pt-30">
          <h2 className="font-bold text-[3rem] 2xl:text-[4rem]">
            Create a session
          </h2>
          <p className="text-[1.5rem] 2xl:text-[2rem]">
            Give your session a topic to get started
          </p>
        </div>

        <Form
          action={handleSessionStart}
          className="flex flex-col w-160 items-center gap-20 pt-20"
        >
          <SessionNameInput sessionName={name} onSessionNameChange={setName} />

          <Button type="submit" className="w-75 bg-magenta hover:bg-[#AA0045]">
            <Image src="/images/start.svg" alt="" width={20} height={22} />
            Start
          </Button>
        </Form>
      </div>
    </main>
  );
}
