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
    <footer className="relative z-10 flex w-200 items-center justify-between pb-12 gap-10">
      <SessionNameInput
        sessionName={sessionName}
        onSessionNameChange={onSessionNameChange}
        onSessionNameSave={onSessionNameSave}
      />

      <Button
        className="w-70 border-3 border-[#F562A1] hover:bg-[#F562A1]"
        onClick={onReset}>
        <Image src="/images/reset.svg" alt="" width={25} height={25} />
        Reset
      </Button>
    </footer>
  );
}
