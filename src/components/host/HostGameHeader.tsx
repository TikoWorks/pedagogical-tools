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
    <div className="relative z-10 w-full flex items-start justify-between px-8 pt-8">
      <div>
        <HostHeader />

        <section className="flex flex-col items-center justify-center text-white">
          <h2 className="font-bold text-[2.25rem]">{sessionName}</h2>
        </section>
      </div>

      <section className="flex items-start">
        <QRCode
          joinUrl={joinUrl}
          className="h-30 w-30"
          containerClassName="rounded-sm px-3 py-2"
        />
      </section>
    </div>
  );
}
