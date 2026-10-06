import Image from 'next/image';

type SessionNameInputProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave: (name: string) => Promise<void>;
};

export default function SessionNameInput({
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
}: SessionNameInputProps) {
  return (
    <div className="relative w-full">
      <input
        className="h-16 w-full rounded-2xl bg-tumma/50 border-3 border-white/30 px-12 text-center text-white text-[1.75rem]"
        type="text"
        value={sessionName}
        onChange={(event) => onSessionNameChange(event.target.value)}
        onBlur={() => onSessionNameSave(sessionName)}
      />
      <Image
        className="absolute top-1/2 right-6 -translate-y-1/2"
        src="/images/pencil.svg"
        alt=""
        width={25}
        height={25}
      />
    </div>
  );
}
