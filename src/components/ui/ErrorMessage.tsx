type ErrorMessageProps = {
  message: string;
  className?: string;
};

export default function ErrorMessage({
  message,
  className = '',
}: ErrorMessageProps) {
  return (
    <p
      role="alert"
      className={`text-center text-magenta text-[1.5rem] ${className}`}
    >
      {message}
    </p>
  );
}
