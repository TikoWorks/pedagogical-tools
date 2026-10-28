'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import WordCloudHeader from '../ui/WordCloudHeader';
import QRCode from './QRCode';

type HostGameHeaderProps = {
  joinUrl: string;
  sessionName: string;
};

export default function HostGameHeader({
  joinUrl,
  sessionName,
}: HostGameHeaderProps) {
  const [isPresentationView, setIsPresentationView] = useState(false);
  return (
    <div className="relative z-10 flex items-start justify-between px-8 pt-6 2xl:px-20 2xl:pt-8">
      <WordCloudHeader />

      <section className="bg-tumma flex h-32 w-fit max-w-120 flex-col items-center justify-center rounded-2xl px-6 text-center text-white 2xl:h-40 2xl:max-w-180 2xl:px-8">
        <h3 className="text-[1.75rem] leading-none 2xl:text-[2.25rem]">
          Topic
        </h3>

        <h2 className="w-full break-words text-[3rem] leading-none font-bold 2xl:text-[4rem]">
          {sessionName}
        </h2>
      </section>
      <section className="flex items-start gap-6">
        <div className="whitespace-nowrap">
          <Button
            className={`mb-5 ml-25 w-50 2xl:ml-20 2xl:w-75 border ${
              isPresentationView
                ? 'border-magenta bg-magenta hover:border-tumma hover:bg-magenta-tumma'
                : 'border-white/30 bg-tumma hover:border-vaalea'
            }`}
            onClick={() => setIsPresentationView(!isPresentationView)}
          >
            Presentation view
          </Button>

          <div
            className={`flex items-start gap-6 ${
              isPresentationView ? 'invisible' : ''
            }`}
          >
            <div className="whitespace-nowrap">
              <p className="text-[1.75rem] font-bold text-white 2xl:text-[2.25rem]">
                Add a word
              </p>
              <p className="text-[1.375rem] text-white 2xl:text-[1.75rem]">
                Scan QR code
              </p>
            </div>
            <QRCode
              joinUrl={joinUrl}
              className="h-24 w-24 2xl:h-30 2xl:w-30"
              containerClassName="rounded-sm px-2 py-2 2xl:px-3"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
