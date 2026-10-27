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
  onCloseClick: () => void;
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
  onCloseClick,
}: HostGameFooterProps) {
  return (
    <footer className="relative z-10 flex w-full items-center px-8 pb-12 2xl:px-20">
      <div className="flex w-[70%] items-center justify-between gap-6 2xl:gap-10 2xl:w-[60%]">
        <SessionNameInput
          sessionName={sessionName}
          onSessionNameChange={onSessionNameChange}
          onSessionNameSave={onSessionNameSave}
          isSavingName={isSavingName}
          saveNameError={saveNameError}
        />

        <Button
          className="w-60 border-1 border-[#F562A1] hover:bg-tumma 2xl:w-100"
          onClick={onReset}
        >
          <Image
            src="/images/reset.svg"
            alt=""
            width={25}
            height={25}
            className="h-auto w-5 2xl:w-6"
          />
          Reset
        </Button>
        <Button
          className={`w-60 border 2xl:w-100 ${
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
            className="h-auto w-7 2xl:w-8"
          />

          <span>{state === 'paused' ? 'Resume' : 'Pause'}</span>
        </Button>
      </div>
      <Button
        className="ml-auto border-1 w-30 border-[#F562A1] hover:bg-tumma 2xl:w-55"
        onClick={onCloseClick}
      >
        Close
      </Button>
    </footer>
  );
}
