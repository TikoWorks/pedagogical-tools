import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserPage from './page';

const mockUseParams = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

describe('UserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseParams.mockReturnValue({
      join_code: 'TEST123',
    });

    global.fetch = vi.fn();

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'participant-123' }),
    } as Response);
  });

  it('renders the input view initially', () => {
    render(<UserPage />);

    expect(
      screen.getByRole('heading', { name: 'WordCloud' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('textbox')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();

    expect(screen.getByText('0/25 characters')).toBeInTheDocument();
  });

  it('adds a participant using the join code on mount', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/participant/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: 'TEST123' }),
      });
    });
  });

  it('does not add a participant when the join code is missing', () => {
    mockUseParams.mockReturnValue({
      join_code: undefined,
    });

    render(<UserPage />);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('updates the input and character counter', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByRole('textbox');

    await user.type(input, 'hello');

    expect(input).toHaveValue('hello');
    expect(screen.getByText('5/25 characters')).toBeInTheDocument();
  });

  it('disables Send when the input is empty', () => {
    render(<UserPage />);

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('does not submit a whitespace-only word', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    await user.type(screen.getByRole('textbox'), '   ');

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();

    expect(
      vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/submission/'),
    ).toHaveLength(0);
  });

  it('shows the clear button and clears the input', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByRole('textbox');

    await user.type(input, 'hello');

    const clearButton = screen.getByRole('button', {
      name: 'Clear input',
    });

    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(screen.getByText('0/25 characters')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Clear input' }),
    ).not.toBeInTheDocument();
  });

  it('submits a word successfully', async () => {
    const user = userEvent.setup();

    // Override the default participant response and add
    // a response for the submission request.
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'participant-123' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/submission/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { word: 'hello' },
          participantId: 'participant-123',
        }),
      });
    });

    expect(await screen.findByText('Word sent!')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Add new word' }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows the sending state while the submission is in progress', async () => {
    const user = userEvent.setup();

    let resolveSubmission!: (response: Response) => void;

    const submissionPromise = new Promise<Response>((resolve) => {
      resolveSubmission = resolve;
    });

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'participant-123' }),
      } as Response)
      .mockImplementationOnce(() => submissionPromise);

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByText('Sending...')).toBeInTheDocument();

    expect(
      screen.getByText('Word is being added to WordCloud'),
    ).toBeInTheDocument();

    resolveSubmission({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    expect(await screen.findByText('Word sent!')).toBeInTheDocument();
  });

  it('returns to the input view when submission fails', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'participant-123' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response);

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('returns to the input view when the submission request throws', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'participant-123' }),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  it('allows the user to add another word after a successful submission', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'participant-123' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByText('Word sent!')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add new word' }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.getByText('0/25 characters')).toBeInTheDocument();
  });

  it('limits the input to 25 characters', () => {
    render(<UserPage />);

    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '25');
  });
});
