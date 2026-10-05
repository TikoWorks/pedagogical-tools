import Image from 'next/image';
import { useState } from 'react';

type SessionNameInputProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => Promise<void>;
};

export default function SessionNameInput({
  sessionName,
  onSessionNameChange,
}: SessionNameInputProps) {
  const [name, setName] = useState(sessionName);

  return (
    <div className="relative w-full">
      <input
        className="h-14 w-full rounded-3xl bg-tumma/50 px-12 text-center text-[1.5rem] font-normal text-white 2xl:h-20 2xl:text-[2rem]"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => onSessionNameChange(name)}
      />
      <Image
        className="absolute top-1/2 right-6 -translate-y-1/2 2xl:h-8 2xl:w-8"
        src="/images/pencil.svg"
        alt=""
        width={20}
        height={20}
      />
    </div>
  );
}
