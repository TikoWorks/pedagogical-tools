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

// Sanan koko kasvaa esiintymismäärän mukaan ja skaalautuu käytettävissä olevaan tilaan
function getFontSize(count: number, scale: number) {
  const minSize = 36;
  const growth = 20 * scale;

  return Math.min(minSize + (count - 1) * growth, 128);
}

// Värit kiertävät sanojen järjestyksen mukaan
function getColor(index: number) {
  return colors[index % colors.length];
}

// Useammin esiintyvät sanat näytetään lihavoituna
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

  // Seurataan sanapilven käytettävissä olevan alueen kokoa
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

  // Lasketaan sanojen sijoittelu uudelleen, kun sanat tai käytettävissä oleva tila muuttuvat
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
    let cancelPendingLayout: (() => void) | undefined;

    async function createCloud() {
      // Odotetaan fonttien latautumista ennen sijoittelua
      await document.fonts.ready;

      if (cancelled) return;

      // Yritetään sijoittaa sanat annetulla fonttikoon kertoimella
      function tryLayout(fontScale: number): Promise<CloudWord[] | null> {
        return new Promise((resolve) => {
          const scaledWords = cloudWords.map((word) => ({
            ...word,
            size: word.size * fontScale,
          }));

          // Keskeytetty laskenta palauttaa null-arvon
          cancelPendingLayout = () => resolve(null);

          layout = cloud<CloudWord>()
            .size([size.width, size.height])
            .words(scaledWords)
            .padding(10)
            .spiral('archimedean')
            .rotate(() => 0)
            .font('Poppins')
            .fontSize((word) => word.size)
            .fontWeight((word) => getFontWeight(word.count))
            .on('end', (placedWords) => {
              console.log('Cloud placed:', placedWords);
              resolve(placedWords);
            });
          layout.start();
        });
      }

      let bestWords: CloudWord[] = [];

      // Pienennetään fontteja, kunnes kaikki sanat mahtuvat
      for (const fontScale of [1, 0.9, 0.8, 0.7, 0.6, 0.5]) {
        if (cancelled) return;

        const placedWords = await tryLayout(fontScale);

        if (cancelled || placedWords === null) return;

        // Tallennetaan paras tulos siltä varalta, ettei kaikkia saada sijoitettua
        if (placedWords.length > bestWords.length) {
          bestWords = placedWords;
        }

        if (placedWords.length === cloudWords.length) {
          setWords(placedWords);
          return;
        }
      }

      // Näytetään paras tulos, vaikka kaikki sanat eivät mahtuisi
      setWords(bestWords);
    }
    createCloud();

    return () => {
      cancelled = true;
      layout?.stop();
      cancelPendingLayout?.();
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
                  transition: 'transform 600ms ease, font-size 600ms ease',
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
