import Image from 'next/image';
import { useState } from 'react';

type SessionNameInputProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave?: (name: string) => Promise<void>;
};

export default function SessionNameInput({
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
}: SessionNameInputProps) {
  const [error, setError] = useState('');

  async function handleBlur() {
    if (!sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    setError('');
    await onSessionNameSave?.(sessionName);
  }

  return (
    <div className="relative w-full">
      {error && (
        <p className="text-magenta absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[1rem] 2xl:text-[1.5rem]">
          {error}
        </p>
      )}

      <input
        className="bg-tumma/50 h-12 w-full rounded-2xl border-3 border-white/30 px-10 text-center text-[1.25rem] text-white focus:border-[#F562A1] focus:outline-none 2xl:h-16 2xl:px-12 2xl:text-[1.75rem]"
        type="text"
        value={sessionName}
        onChange={(event) => onSessionNameChange(event.target.value)}
        onBlur={handleBlur}
      />

      <Image
        className="absolute top-1/2 right-4 h-auto w-5 -translate-y-1/2 2xl:right-6 2xl:w-[25px]"
        src="/images/pencil.svg"
        alt=""
        width={25}
        height={25}
      />
    </div>
  );
}
