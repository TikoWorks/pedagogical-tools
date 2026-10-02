import type { Submission } from '@/types/submission';

type WordCloudProps = {
  submissions: Submission[];
};

function getFontSize(count: number) {
  return Math.min(20 + count * 4, 60);
}

export default function WordCloud({ submissions }: WordCloudProps) {
  return (
    <div>
      {submissions.map((submission) => (
        <p
          key={submission.word}
          style={{
            fontSize: getFontSize(submission.count),
            color: submission.color,
          }}
        >
          {submission.word} {submission.count}
        </p>
      ))}
    </div>
  );
}
