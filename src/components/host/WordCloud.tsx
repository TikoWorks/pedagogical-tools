import type { Submission } from '@/types';

type WordCloudProps = {
  submissions: Submission[];
  width: number;
  height: number;
};

type PlacedWord = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const colors = ['#3CD4D0', '#625BC4', '#FFFFFF', '#F562A1'];

function getFontSize(count: number) {
  return Math.min(36 + (count - 1) * 20, 128);
}

function getHash(word: string) {
  let hash = 0;

  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}

function getColor(word: string) {
  return colors[getHash(word) % colors.length];
}

function getFontWeight(fontSize: number) {
  return fontSize === 36 ? 400 : 700;
}

function overlaps(a: PlacedWord, b: PlacedWord) {
  const gap = 30;

  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

export default function WordCloud({
  submissions,
  width,
  height,
}: WordCloudProps) {
  const placedWords: PlacedWord[] = [];

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      {submissions.map((submission) => {
        const fontSize = getFontSize(submission.count);
        const wordWidth = submission.word.length * fontSize * 0.6;

        const maxX = width - wordWidth;
        const maxY = height - fontSize;

        let x = getHash(submission.word) % Math.max(maxX, 1);
        let y = (getHash(submission.word) * 31) % Math.max(maxY, 1);

        let wordBox: PlacedWord = {
          x,
          y,
          width: wordWidth,
          height: fontSize,
        };

        let attempt = 1;

        while (placedWords.some((word) => overlaps(wordBox, word))) {
          x = (getHash(submission.word) + attempt * 97) % Math.max(maxX, 1);

          y = (getHash(submission.word) + attempt * 53) % Math.max(maxY, 1);

          wordBox = {
            x,
            y,
            width: wordWidth,
            height: fontSize,
          };

          attempt++;
        }

        placedWords.push(wordBox);

        return (
          <span
            key={submission.word}
            className="absolute whitespace-nowrap"
            style={{
              left: x,
              top: y,
              fontSize,
              fontWeight: getFontWeight(fontSize),
              color: getColor(submission.word),
            }}
          >
            {submission.word}
          </span>
        );
      })}
    </div>
  );
}
