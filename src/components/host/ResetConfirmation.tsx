import Button from './Button';

type ResetConfirmationProps = {
  cancel: () => void;
  reset: () => void;
};

export default function ResetConfirmation({
  cancel,
  reset,
}: ResetConfirmationProps) {
  return (
    <div>
      <Button onClick={cancel}>Cancel</Button>
      <Button onClick={reset}>Reset</Button>
    </div>
  );
}
