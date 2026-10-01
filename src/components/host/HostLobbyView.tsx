import QRCode from './QRCode';
import Image from 'next/image';

type HostLobbyViewProps = {
  sessionName: string;
  joinUrl: string;
  onStart: () => void;
};

export default function HostLobbyView({
  sessionName,
  joinUrl,
  onStart,
}: HostLobbyViewProps) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center pt-16">
      <h1 className="text-magenta text-[3.25rem] font-black 2xl:text-[4rem]">
        WordCloud
      </h1>

      <div className="mt-5 flex flex-col items-center 2xl:mt-12">
        <p className="text-[1.25rem] min-[470px]:text-[1.5rem] font-bold text-white 2xl:text-[2rem] ">
          What word comes first to mind?
        </p>

        <div className="relative mt-8 w-[20rem] min-[470px]:w-[28rem] 2xl:w-[40rem] 2xl:mt-12">
          <input
            className="h-14 w-full rounded-3xl bg-tumma/50 px-12 text-center font-normal text-white text-[1.5rem] 2xl:h-20 2xl:text-[2rem]"
            type="text"
            value={sessionName}
            readOnly
          />

          <Image
            className="absolute top-1/2 right-6 -translate-y-1/2 2xl:h-8 2xl:w-8"
            src="/images/pencil.svg"
            alt=""
            width={20}
            height={20}
          />
        </div>
      </div>

      <QRCode joinUrl={joinUrl} />

      <button
        onClick={onStart}
        className="mt-14 flex h-12 w-56 items-center justify-center gap-2 rounded-full bg-magenta text-[1.5rem] font-bold text-white 2xl:h-19 2xl:w-85 2xl:text-[2.25rem] 2xl:mt-20"
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
