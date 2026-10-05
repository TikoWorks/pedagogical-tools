import WordCloud from './WordCloud';
import type { Submission } from '@/types';
import HostHeader from './HostHeader';
import QRCode from './QRCode';
import SessionNameInput from './SessionNameInput';

type HostGameViewProps = {
  sessionName: string;
  joinUrl: string;
  submissions: Submission[];
  onSessionNameChange: (name: string) => Promise<void>;
};

export default function HostGameView({
  sessionName,
  joinUrl,
  submissions,
  onSessionNameChange,
}: HostGameViewProps) {
  return (
    // Näkymä käyttää koko saatavilla olevan korkeuden
    <div className="relative z-10 flex h-full flex-col pt-5">
      {/* Pelin tiedot ja liittymisohjeet */}
      <div className="flex flex-col items-center gap-4 px-6 xl:flex-row xl:items-start xl:justify-between xl:px-20 2xl:px-40">
        <div className="flex w-full max-w-[40rem] flex-col items-center">
          <HostHeader />
          <SessionNameInput
            sessionName={sessionName}
            onSessionNameChange={onSessionNameChange}
          />
        </div>

        <div className="flex items-start gap-4 pt-2 xl:pt-6 2xl:gap-6">
          <QRCode
            joinUrl={joinUrl}
            className="h-24 w-24 2xl:h-30 2xl:w-30"
            containerClassName="rounded-sm px-3 py-2"
          />

          <div className="flex flex-col">
            <h2 className="text-[1.5rem] font-bold text-white 2xl:text-[2.25rem]">
              Add a word
            </h2>
            <p className="text-white 2xl:text-[1.75rem]">Scan QR code</p>
          </div>
        </div>
      </div>

      {/* Sanapilvi käyttää yläosan jälkeen jäljelle jäävän tilan */}
      <div className="min-h-0 flex-1">
        <WordCloud submissions={submissions} />
      </div>
    </div>
  );
}
