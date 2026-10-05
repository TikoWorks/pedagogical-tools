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
    <div className="relative z-10 flex h-full flex-col pt-5">
      <div className="flex items-start justify-between px-40">
        <div className="flex w-[40rem] flex-col items-center">
          <HostHeader />
          <SessionNameInput
            sessionName={sessionName}
            onSessionNameChange={onSessionNameChange}
          />
        </div>

        <div className="flex items-start gap-6 pt-6">
          <QRCode
            joinUrl={joinUrl}
            className="h-30 w-30"
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

      <div className="min-h-0 flex-1">
        <WordCloud submissions={submissions} />
      </div>
    </div>
  );
}
