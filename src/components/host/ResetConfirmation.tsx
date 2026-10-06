import Button from './Button';
import Image from 'next/image';

type ResetConfirmationProps = {
  onCancel: () => void;
  onReset: () => void;
};

export default function ResetConfirmation({
  onCancel,
  onReset,
}: ResetConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/56">
      <section className="flex flex-col items-center rounded-2xl border-2 border-white/50 bg-[#0D004C] p-10 text-[1.75rem] text-white ">
        <Image
          className="mb-6"
          src="/images/reset2.svg"
          alt=""
          width={80}
          height={80}
        />
        <h2 className="font-bold text-[2rem]">Reset word cloud?</h2>
        <p>This will remove all submitted words</p>

        <div className="flex gap-20 pt-10">
          <Button
            className="w-50 border-2 border-white bg-[#0D004C] hover:bg-tumma"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            className="w-50 bg-magenta hover:bg-[#AA0045]"
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </section>
    </div>
  );
}
