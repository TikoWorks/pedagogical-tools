type LoadingMessageProps = {
  message?: string;
  className?: string;
};

export default function LoadingMessage({
  message,
  className = '',
}: LoadingMessageProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-xl text-white ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent"
      />
      {message && <span>{message}</span>}
    </div>
  );
}
