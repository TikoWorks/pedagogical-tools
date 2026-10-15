import Button from '../ui/Button';
import LoadingMessage from '../ui/LoadingMessage';
import ErrorMessage from '../ui/ErrorMessage';
import Image from 'next/image';

type ResetConfirmationProps = {
  onCancel: () => void;
  onReset: () => void;
  isResetting: boolean;
  resetError: string;
};

export default function ResetConfirmation({
  onCancel,
  onReset,
  isResetting,
  resetError,
}: ResetConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/56">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-title"
        className="bg-paavari flex flex-col items-center rounded-2xl border-2 border-white/50 p-6 text-[1.25rem] text-white 2xl:p-10 2xl:text-[1.75rem]"
      >
        <Image
          className="mb-4 h-auto w-16 2xl:mb-6 2xl:w-26"
          src="/images/reset2.svg"
          alt=""
          width={103}
          height={101}
        />

        <h2
          id="reset-title"
          className="text-[1.5rem] font-bold 2xl:text-[2rem]"
        >
          Reset word cloud?
        </h2>

        <p>This will remove all submitted words</p>

        <div className="relative flex gap-8 pt-6 2xl:gap-20 2xl:pt-10">
          {resetError && (
            <ErrorMessage
              message={resetError}
              className="absolute bottom-full left-1/2 w-max max-w-full -translate-x-1/2 text-base"
            />
          )}

          <Button
            className="bg-paavari w-35 border-2 border-white enabled:hover:bg-tumma 2xl:w-50"
            onClick={onCancel}
            disabled={isResetting}
          >
            Cancel
          </Button>

          <Button
            className="bg-magenta w-35 enabled:hover:bg-[#AA0045] disabled:cursor-wait 2xl:w-50"
            onClick={onReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <LoadingMessage
                message="Resetting..."
                className="text-[1.5rem]"
              />
            ) : (
              'Reset'
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
