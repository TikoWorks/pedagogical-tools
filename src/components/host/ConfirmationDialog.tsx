import Button from '../ui/Button';
import LoadingMessage from '../ui/LoadingMessage';
import ErrorMessage from '../ui/ErrorMessage';
import Image from 'next/image';

type ConfirmationDialogProps = {
  title: string;
  message: string;
  imageSrc: string;
  confirmText: string;
  loadingText: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error: string;
};

export default function ConfirmationDialog({
  title,
  message,
  imageSrc,
  confirmText,
  loadingText,
  onCancel,
  onConfirm,
  isLoading,
  error,
}: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/56">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        className="bg-paavari flex flex-col items-center rounded-2xl border-2 border-white/50 p-6 text-[1.25rem] text-white 2xl:p-10 2xl:text-[1.75rem]"
      >
        <Image
          className="mb-4 h-auto w-16 2xl:mb-6 2xl:w-26"
          src={imageSrc}
          alt=""
          width={103}
          height={101}
        />

        <h2
          id="confirmation-title"
          className="text-[1.5rem] font-bold 2xl:text-[2rem]"
        >
          {title}
        </h2>

        <p>{message}</p>

        <div className="flex flex-col items-center gap-4 pt-6 2xl:pt-10">
          {error && (
            <ErrorMessage
              message={error}
              className="max-w-md text-center text-base"
            />
          )}

          <div className="flex gap-8 2xl:gap-20">
            <Button
              className="bg-paavari w-35 border-2 border-white enabled:hover:bg-tumma 2xl:w-50"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              className="bg-magenta w-35 enabled:hover:bg-[#AA0045] disabled:cursor-wait 2xl:w-50"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingMessage
                  message={loadingText}
                  className="text-[1.5rem]"
                />
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
