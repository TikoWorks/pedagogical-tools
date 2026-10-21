import WordCloudHeader from '../ui/WordCloudHeader';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

type SubmissionFormProps = {
  inputWord: string;
  onWordChange: (word: string) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  participantId: string;
  error: string;
  isPaused: boolean;
};

export default function SubmissionForm({
  inputWord,
  onWordChange,
  onSubmit,
  participantId,
  error,
  isPaused,
}: SubmissionFormProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center pt-12">
      <WordCloudHeader />

      <form
        onSubmit={onSubmit}
        className="flex min-h-0 w-full flex-1 flex-col items-center pt-20 pb-12"
      >
        <div className="w-85 max-w-[calc(100vw-2rem)]">
          <div className="relative">
            <input
              type="text"
              aria-label="Word"
              placeholder="Type here..."
              maxLength={25}
              value={inputWord}
              onChange={(e) => onWordChange(e.target.value)}
              className="h-13 w-full rounded-2xl bg-white px-3 pr-10 text-black shadow-[inset_0_3px_7px_rgba(0,0,0,0.4)]"
            />

            {inputWord.length > 0 && (
              <button
                type="button"
                aria-label="Clear input"
                onClick={() => onWordChange('')}
                className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            )}
          </div>

          <p className="pt-2 text-center text-white">
            {inputWord.length}/25 characters
          </p>

          {isPaused && (
            <p className="mt-3 text-center text-white">Game paused</p>
          )}
          {error && <ErrorMessage message={error} className="mt-3" />}
        </div>

        <Button
          type="submit"
          disabled={!inputWord.trim() || !participantId || isPaused}
          className="mt-auto w-80 max-w-[calc(100vw-2rem)] !rounded-2xl bg-magenta py-3 disabled:bg-[#D4B4C4]"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
