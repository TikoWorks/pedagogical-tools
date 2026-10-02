import { QRCodeSVG } from 'qrcode.react';

type QRCodeProps = {
  joinUrl: string;
};

export default function QRCode({ joinUrl }: QRCodeProps) {
  return (
    <div>
      <div className="flex h-48 w-48 items-center justify-center bg-white rounded-2xl mt-8 2xl:h-78 2xl:w-78 2xl:mt-14">
        <QRCodeSVG className="h-42 w-42 2xl:h-68 2xl:w-68" value={joinUrl} />
      </div>
    </div>
  );
}
