import Image from 'next/image';

type SuccessViewProps = {
  onAddNewWord: () => void;
};

export default function SuccessView({ onAddNewWord }: SuccessViewProps) {
  return (
    <div className="relative text-white flex flex-1 flex-col items-center h-full">
      <Image
        src="/images/confetti.png"
        alt="confetti"
        width={500}
        height={500}
        className="mt-20"
      />

      <Image
        src="/images/success.svg"
        alt=""
        width={180}
        height={180}
        className="absolute left-1/2 -translate-x-1/2 top-50"
      />

      <h1 className="font-extrabold absolute left-1/2 w-3/4 text-center -translate-x-1/2 top-100 text-4xl">
        Word sent!
      </h1>

      <button
        onClick={onAddNewWord}
        className="mt-auto mb-28 bg-magenta px-8 py-4 rounded-2xl w-3/4 text-white text-2xl font-bold"
      >
        Add new word
      </button>
    </div>
  );
}
