'use client';
import Button from '@/components/host/Button';
import SessionNameInput from '@/components/host/SessionNameInput';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import HostHeader from '@/components/host/HostHeader';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleSessionStart = async () => {
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      router.push(`/host/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      setCreateError('Could not create session. Please try again.');
      setIsLoading(false);
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

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSessionStart();
          }}
          className="flex w-130 flex-col items-center gap-12 pt-15 2xl:w-160 2xl:gap-20 2xl:pt-20"
        >
          <div className="relative w-full">
            <SessionNameInput
              sessionName={name}
              onSessionNameChange={setName}
            />
            {createError && (
              <p
                role="alert"
                className="absolute top-full mt-2 w-full text-center text-magenta text-[1.5rem]"
              >
                {createError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className={`
            w-50 bg-magenta enabled:hover:bg-[#AA0045]
            2xl:w-75
            ${isLoading ? 'disabled:cursor-wait' : 'disabled:bg-[#D4B4C4] disabled:cursor-not-allowed'}`}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent " />
                Starting...
              </>
            ) : (
              <>
                <Image
                  src="/images/start.svg"
                  alt=""
                  width={20}
                  height={22}
                  className="h-auto w-4 2xl:w-5"
                />
                Start
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
