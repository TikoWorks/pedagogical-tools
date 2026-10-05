import QRCode from './QRCode';
import Image from 'next/image';
import HostHeader from './HostHeader';
import SessionNameInput from './SessionNameInput';

type HostLobbyViewProps = {
  sessionName: string;
  joinUrl: string;
  onStart: () => void;
  onSessionNameChange: (name: string) => Promise<void>;
};

export default function HostLobbyView({
  sessionName,
  joinUrl,
  onStart,
  onSessionNameChange,
}: HostLobbyViewProps) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center pt-16">
      <HostHeader />

      {/* Pelin ohje ja muokattava session nimi */}
      <div className="mt-5 flex flex-col items-center 2xl:mt-12">
        <p className="text-[1.25rem] font-bold text-white min-[470px]:text-[1.5rem] 2xl:text-[2rem]">
          What word comes first to mind?
        </p>

        <div className="relative mt-8 w-[20rem] min-[470px]:w-[28rem] 2xl:mt-12 2xl:w-[40rem]">
          <SessionNameInput
            sessionName={sessionName}
            onSessionNameChange={onSessionNameChange}
          />
        </div>
      </div>

      {/* QR-koodi osallistujien liittymistä varten */}
      <div className="mt-8 2xl:mt-14">
        <QRCode
          joinUrl={joinUrl}
          className="h-42 w-42 2xl:h-68 2xl:w-68"
          containerClassName="rounded-xl p-4"
        />
      </div>

      {/* Käynnistää session pelinäkymän */}
      <button
        onClick={onStart}
        className="mt-14 flex h-12 w-56 items-center justify-center gap-2 rounded-full bg-magenta text-[1.5rem] font-bold text-white 2xl:mt-20 2xl:h-19 2xl:w-85 2xl:text-[2.25rem]"
      >
        Start
        <Image
          className="translate-x-2 2xl:h-8 2xl:w-8"
          src="/images/arrow.svg"
          alt=""
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}
