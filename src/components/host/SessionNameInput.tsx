import Image from 'next/image';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingMessage from '@/components/ui/LoadingMessage';

type SessionNameInputProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave?: (name: string) => Promise<void>;
  isSavingName?: boolean;
  saveNameError?: string;
};

export default function SessionNameInput({
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
  isSavingName = false,
  saveNameError = '',
}: SessionNameInputProps) {
  const [error, setError] = useState('');

  async function handleBlur() {
    if (isSavingName) return;

    if (!sessionName.trim()) {
      setError('Subject is required');
      return;
    }

    setError('');
    await onSessionNameSave?.(sessionName);
  }

  return (
    <div className="relative w-full">
      {(error || saveNameError) && (
        <ErrorMessage
          message={error || saveNameError}
          className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[1.5rem]"
        />
      )}

      {isSavingName && <LoadingMessage message="Saving..." />}
      <input
        className="bg-tumma/50 h-13 w-full rounded-2xl border-3 border-white/30 px-10 text-center text-[1.25rem] text-white focus:border-[#F562A1] focus:outline-none 2xl:h-16 2xl:px-12 2xl:text-[1.75rem]"
        type="text"
        value={sessionName}
        onChange={(event) => {
          onSessionNameChange(event.target.value);
          setError('');
        }}
        onBlur={handleBlur}
        required
      />

      <Image
        className="absolute top-1/2 right-4 h-auto w-5 -translate-y-1/2 2xl:right-6 2xl:w-[25px]"
        src="/images/pencil.svg"
        alt=""
        width={25}
        height={25}
        loading="eager"
      />
    </div>
  );
}
