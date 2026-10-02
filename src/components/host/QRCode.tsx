import { QRCodeSVG } from 'qrcode.react';

type QRCodeProps = {
  joinUrl: string;
  className?: string;
  containerClassName?: string;
};

export default function QRCode({
  joinUrl,
  className,
  containerClassName,
}: QRCodeProps) {
  return (
    <div
      className={`flex w-fit items-center justify-center bg-white ${containerClassName}`}
    >
      <QRCodeSVG className={className} value={joinUrl} />
    </div>
  );
}
