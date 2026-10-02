import Image from 'next/image';

type SessionNameInputProps = {
  sessionName: string;
};

export default function SessionNameInput({
  sessionName,
}: SessionNameInputProps) {
  return (
    <div className="relative w-full">
      <input
        className="h-14 w-full rounded-3xl bg-tumma/50 px-12 text-center font-normal text-white text-[1.5rem] 2xl:h-20 2xl:text-[2rem]"
        type="text"
        value={sessionName}
        readOnly
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
