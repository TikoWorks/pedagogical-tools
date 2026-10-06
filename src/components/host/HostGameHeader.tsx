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
    <div className="relative z-10 flex items-start justify-between px-20 pt-8">
      <HostHeader />

      <section className="flex flex-col items-center justify-center text-white pt-20">
        <h3 className="text-[2.25rem]">Topic</h3>
        <h2 className="font-bold text-[6rem]">{sessionName}</h2>
      </section>

      <section className="flex items-start gap-14">
        <QRCode
          joinUrl={joinUrl}
          className="h-30 w-30"
          containerClassName="rounded-sm px-3 py-2"
        />

        <div className="flex flex-col">
          <div>
            <p className="text-[2.25rem] font-bold text-white">Add a word</p>
            <p className="text-[1.75rem] text-white">Scan QR code</p>
          </div>
        </div>
      </section>
    </div>
  );
}
