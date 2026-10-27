import Image from 'next/image';
import SessionNameInput from './SessionNameInput';
import Button from '../ui/Button';

type HostGameFooterProps = {
  sessionName: string;
  state: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave: (name: string) => Promise<void>;
  onReset: () => void;
  isSavingName: boolean;
  saveNameError: string;
  handlePauseResume: () => void;
  deleteSession: () => void;
};

export default function HostGameFooter({
  sessionName,
  state,
  onSessionNameChange,
  onSessionNameSave,
  onReset,
  isSavingName,
  saveNameError,
  handlePauseResume,
  deleteSession,
}: HostGameFooterProps) {
  return (
    <footer className="relative z-10 w-[70%] flex items-center justify-between pb-12 gap-10 px-8 2xl:px-20">
      <SessionNameInput
        sessionName={sessionName}
        onSessionNameChange={onSessionNameChange}
        onSessionNameSave={onSessionNameSave}
        isSavingName={isSavingName}
        saveNameError={saveNameError}
      />

      <Button
        className="w-85 border-1 border-[#F562A1] hover:bg-tumma 2xl: w-105"
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
      <Button
        className={`w-85 border 2xl:w-105 ${
          state === 'paused'
            ? 'border-magenta bg-magenta hover:border-[#AA0045] hover:bg-[#AA0045]'
            : 'border-[#F562A1] hover:bg-tumma'
        }`}
        onClick={handlePauseResume}
      >
        <Image
          src={state === 'paused' ? '/images/play.svg' : '/images/pause.svg'}
          alt=""
          width={0}
          height={0}
          className="h-auto w-7 2xl: w-8"
        />

        <span>{state === 'paused' ? 'Resume' : 'Pause'}</span>
      </Button>
      <Button
        className="w-75 border-1 border-[#F562A1] hover:bg-tumma 2xl:w-95"
        onClick={deleteSession}
      >
        Quit
      </Button>
    </footer>
  );
}
