import HostHeader from './HostHeader';
import QRCode from './QRCode';

type HostGameHeaderProps = {
  joinUrl: string;
  sessionName: string;
};

export default function HostGameHeader({
  joinUrl,
  sessionName,
}: HostGameHeaderProps) {
  return (
    <div className="relative z-10 flex items-start justify-between px-8 pt-6 2xl:px-20 2xl:pt-8">
      <HostHeader />

      <section className="bg-tumma flex h-32 w-fit max-w-120 flex-col items-center justify-center rounded-2xl px-6 text-center text-white 2xl:h-40 2xl:max-w-180 2xl:px-8">
        <h3 className="text-[1.75rem] leading-none 2xl:text-[2.25rem]">
          Topic
        </h3>

        <h2 className="w-full break-words text-[3rem] leading-none font-bold 2xl:text-[4rem]">
          {sessionName}
        </h2>
      </section>

      <section className="flex items-start gap-6">
        <QRCode
          joinUrl={joinUrl}
          className="h-24 w-24 2xl:h-30 2xl:w-30"
          containerClassName="rounded-sm px-2 py-2 2xl:px-3"
        />
        <div className="whitespace-nowrap">
          <p className="text-[1.75rem] font-bold text-white 2xl:text-[2.25rem]">
            Add a word
          </p>
          <p className="text-[1.375rem] text-white 2xl:text-[1.75rem]">
            Scan QR code
          </p>
        </div>
      </section>
    </div>
  );
}
