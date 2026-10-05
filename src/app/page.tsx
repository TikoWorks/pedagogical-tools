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
      <h1 className="text-4xl font-semibold my-8 text-magenta mb-20">
        WordCloud
      </h1>
      <Form
        action={handleSessionStart}
        className="flex flex-col gap-4 w-2/5 items-center">
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject"
          className=" py-2 px-4 mb-6 rounded-lg text-white bg-[#000026]/50 font-md text-center placeholder:text-white w-full focus:placeholder-transparent"
        />
        <button
          type="submit"
          className="py-2 px-4 font-semibold bg-magenta text-zinc-200 rounded-4xl hover:bg-[#3CD4D0] hover:cursor-pointer w-1/2 flex flex-row justify-center items-center gap-2">
          Start
          <svg
            width="14"
            height="10"
            viewBox="0 0 28 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.0833 2.62769C15.8073 2.33149 15.6571 1.93973 15.6642 1.53494C15.6714 1.13014 15.8353 0.743923 16.1216 0.457645C16.4079 0.171368 16.7941 0.00738555 17.1989 0.000243432C17.6037 -0.00689868 17.9955 0.143357 18.2917 0.419357L26.625 8.75269C26.9176 9.04566 27.082 9.44279 27.082 9.85686C27.082 10.2709 26.9176 10.6681 26.625 10.961L18.2917 19.2944C18.1486 19.4479 17.9761 19.571 17.7845 19.6564C17.5928 19.7418 17.3859 19.7877 17.1761 19.7914C16.9663 19.7951 16.7579 19.7565 16.5633 19.6779C16.3688 19.5994 16.192 19.4824 16.0437 19.334C15.8953 19.1856 15.7783 19.0089 15.6997 18.8144C15.6212 18.6198 15.5826 18.4114 15.5863 18.2016C15.59 17.9918 15.6359 17.7849 15.7213 17.5932C15.8067 17.4016 15.9298 17.2291 16.0833 17.086L21.75 11.4194H1.5625C1.1481 11.4194 0.750671 11.2547 0.457645 10.9617C0.16462 10.6687 0 10.2713 0 9.85686C0 9.44246 0.16462 9.04503 0.457645 8.752C0.750671 8.45898 1.1481 8.29436 1.5625 8.29436H21.75L16.0833 2.62769Z"
              fill="white"
            />
          </svg>
        </button>
      </Form>
    </main>
  );
}
