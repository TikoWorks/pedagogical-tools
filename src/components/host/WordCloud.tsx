'use client';
import { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import type { Submission } from '@/types';

type WordCloudProps = {
  submissions: Submission[];
};

type CloudWord = {
  text: string;
  count: number;
  size: number;
  color: string;
  x?: number;
  y?: number;
};

const colors = ['#3CD4D0', '#625BC4', '#FFFFFF', '#F562A1'];

// Kasvatetaan fonttikokoa sanan esiintymismäärän mukaan
function getFontSize(count: number, scale: number) {
  const minSize = 36;
  const growth = 20 * scale;

  return Math.min(minSize + (count - 1) * growth, 128);
}

// Valitaan sanalle väri hash-arvon perusteella
function getColor(index: number) {
  return colors[index % colors.length];
}

function getFontWeight(count: number) {
  return count === 1 ? 400 : 700;
}

export default function WordCloud({ submissions }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const [words, setWords] = useState<CloudWord[]>([]);
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      setSize((currentSize) => {
        if (currentSize.width === width && currentSize.height === height) {
          return currentSize;
        }

        return { width, height };
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  useEffect(() => {
    if (submissions.length === 0 || size.width === 0 || size.height === 0) {
      return;
    }

    const widthScale = size.width / 1600;
    const heightScale = size.height / 480;
    const scale = Math.min(widthScale, heightScale);

    // Muutetaan submissionit d3-cloudin käyttämään muotoon
    const cloudWords = submissions.map((submission, index) => ({
      text: submission.word,
      count: submission.count,
      size: getFontSize(submission.count, scale),
      color: getColor(index),
    }));

    let cancelled = false;
    let layout: ReturnType<typeof cloud<CloudWord>> | undefined;

    async function createCloud() {
      // Odotetaan, että selaimen fontit ovat latautuneet
      await document.fonts.ready;

      if (cancelled) {
        return;
      }

      // d3-cloud laskee sanoille paikat ja estää päällekkäisyyksiä
      layout = cloud<CloudWord>()
        .size([size.width, size.height])
        .words(cloudWords)
        .padding(25)
        .spiral('archimedean')
        .rotate(() => 0)
        .font('Poppins')
        .fontSize((word) => word.size)
        .fontWeight((word) => getFontWeight(word.count))
        .on('end', (placedWords) => {
          if (!cancelled) {
            setWords(placedWords);
          }
        });

      layout.start();
    }
    createCloud();

    return () => {
      cancelled = true;
      layout?.stop();
    };
  }, [submissions, size]);
  return (
    <div ref={containerRef} className="h-full w-full">
      {submissions.length > 0 && (
        <svg width="100%" height="100%">
          <g transform={`translate(${size.width / 2}, ${size.height / 2})`}>
            {words.map((word) => (
              <text
                key={word.text}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`translate(${word.x ?? 0}, ${word.y ?? 0})`}
                style={{
                  fontFamily: 'Poppins',
                  fontSize: word.size,
                  fontWeight: getFontWeight(word.count),
                  fill: word.color,
                }}
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
