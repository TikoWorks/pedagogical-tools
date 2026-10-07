import Image from 'next/image';
import SessionNameInput from './SessionNameInput';
import Button from './Button';

type HostGameFooterProps = {
  onReset: () => void;
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave: (name: string) => Promise<void>;
};

export default function HostGameFooter({
  onReset,
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
}: HostGameFooterProps) {
  return (
    <footer className="relative z-10 flex w-150 items-center justify-between pb-12 gap-10 px-8 2xl:px-20 2xl:w-225">
      <SessionNameInput
        sessionName={sessionName}
        onSessionNameChange={onSessionNameChange}
        onSessionNameSave={onSessionNameSave}
      />

      <Button
        className="w-50 border-3 border-[#F562A1] bg-paavari hover:bg-tumma 2xl:w-70"
        onClick={onReset}
      >
        <Image src="/images/reset.svg" alt="" width={25} height={25} />
        Reset
      </Button>
    </footer>
  );
}
