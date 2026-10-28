import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import HostPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/components/host/WordCloud', () => ({
  default: ({ submissions }: { submissions: { word: string }[] }) => (
    <div data-testid="word-cloud">
      {submissions.map((item) => item.word).join(', ')}
    </div>
  ),
}));

vi.mock('@/components/host/HostGameHeader', () => ({
  default: () => <div>Host header</div>,
}));

vi.mock('@/components/host/HostGameFooter', () => ({
  default: () => <div>Host footer</div>,
}));

const session = {
  id: 'session-123',
  name: 'Test session',
  state: 'active',
  join_code: 'ABC123',
};

function mockApi(submissions: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (url === '/api/session') {
        return Promise.resolve({
          ok: true,
          json: async () => session,
        });
      }

      if (url === '/api/submission' || url === '/api/submission/') {
        return Promise.resolve({
          ok: true,
          json: async () => submissions,
        });
      }

      return Promise.reject(new Error(`Unexpected request: ${url}`));
    }),
  );
}

describe('HostPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('displays a loading message while fetching the session', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    render(<HostPage />);

    expect(screen.getByText('Loading session...')).toBeInTheDocument();
  });

  it('displays an empty state when there are no submissions', async () => {
    mockApi([]);

    render(<HostPage />);

    expect(await screen.findByText('No words yet')).toBeInTheDocument();
  });

  it('displays submitted words in the word cloud', async () => {
    mockApi([{ data: { word: 'Running' } }, { data: { word: 'Tampere' } }]);

    render(<HostPage />);

    await waitFor(() => {
      expect(screen.getByTestId('word-cloud')).toHaveTextContent(
        'running, tampere',
      );
    });
  });
});
