import Image from 'next/image';
import SessionNameInput from './SessionNameInput';
import Button from '../ui/Button';

type HostGameFooterProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave: (name: string) => Promise<void>;
  onReset: () => void;
  isSavingName: boolean;
  saveNameError: string;
};

export default function HostGameFooter({
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
  onReset,
  isSavingName,
  saveNameError,
}: HostGameFooterProps) {
  return (
    <footer className="relative z-10 flex w-150 items-center justify-between pb-12 gap-10 px-8 2xl:px-20 2xl:w-225">
      <SessionNameInput
        sessionName={sessionName}
        onSessionNameChange={onSessionNameChange}
        onSessionNameSave={onSessionNameSave}
        isSavingName={isSavingName}
        saveNameError={saveNameError}
      />

      <Button
        className="w-55 border-3 border-[#F562A1] hover:bg-tumma 2xl:w-70"
        onClick={onReset}
      >
        <Image
          src="/images/reset.svg"
          alt=""
          width={25}
          height={25}
          className="h-auto w-5 2xl: w-6"
        />
        Reset
      </Button>
    </footer>
  );
}
