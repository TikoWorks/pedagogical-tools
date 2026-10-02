import WordCloud from './WordCloud';
import type { Submission } from '@/types/submission';

type HostGameViewProps = {
  sessionName: string;
  submissions: Submission[];
};

export default function HostGameView({
  sessionName,
  submissions,
}: HostGameViewProps) {
  return (
    <div className="relative z-10">
      <h1 className="text-magenta text-[3.25rem] font-black">WordCloud</h1>

      <h2 className="text-white">{sessionName}</h2>

      <WordCloud submissions={submissions} />
    </div>
  );
}
