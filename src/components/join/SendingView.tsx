import Image from 'next/image';

export default function SendingView() {
  return (
    <div className="text-white flex flex-col items-center justify-center mt-60">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-4 h-4 bg-[#625BC4] rounded-full animate-bounce" />
      </div>

      <h1 className="text-[2rem] font-bold mb-4 mt-12">Sending...</h1>

      <Image
        src="/images/sending.svg"
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 mr-2"
      />

      <p className="text-center mt-4">Word is being added to WordCloud</p>
    </div>
  );
}
