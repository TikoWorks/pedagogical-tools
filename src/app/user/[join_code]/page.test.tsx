import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import UserPage from './page';

const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

vi.mock('next/form', () => ({
  default: ({
    action,
    children,
    ...props
  }: {
    action: () => Promise<unknown>;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <form
      {...props}
      onSubmit={async (event) => {
        event.preventDefault();
        await action();
      }}>
      {children}
    </form>
  ),
}));

describe('UserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGet.mockReturnValue('ABC123');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          id: 'participant-123',
        }),
      }),
    );
  });

  it('renders the page correctly', () => {
    render(<UserPage />);

    expect(
      screen.getByRole('heading', { name: 'WordCloud' }),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();

    expect(screen.getByText('0/25 characters')).toBeInTheDocument();
  });

  it('adds a participant using the join code', async () => {
    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/participant/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: 'ABC123',
        }),
      });
    });
  });

  it('stores the participant id returned by the API', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');
    await user.type(input, 'hello');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/participant/',
        expect.any(Object),
      );
    });

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/submission/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: 'hello',
          participantId: 'participant-123',
        }),
      });
    });
  });

  it('updates the character counter when typing', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');

    await user.type(input, 'hello');

    expect(screen.getByText('5/25 characters')).toBeInTheDocument();
  });

  it('allows at most 25 characters', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');

    await user.type(input, '123456789012345678901234567890');

    expect(input).toHaveValue('1234567890123456789012345');
    expect(screen.getByText('25/25 characters')).toBeInTheDocument();
  });

  it('disables Send when the input is empty', () => {
    render(<UserPage />);

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('enables Send when the input contains a non-whitespace character', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, 'hello');

    expect(sendButton).toBeEnabled();
  });

  it('keeps Send disabled when the input contains only whitespace', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    await user.type(input, '   ');

    expect(input).toHaveValue('   ');
    expect(sendButton).toBeDisabled();
  });

  it('shows the clear button when there is input', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');

    expect(
      screen.queryByRole('button', { name: 'Clear input' }),
    ).not.toBeInTheDocument();

    await user.type(input, 'hello');

    expect(
      screen.getByRole('button', { name: 'Clear input' }),
    ).toBeInTheDocument();
  });

  it('clears the input when the clear button is clicked', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');

    await user.type(input, 'hello');

    await user.click(screen.getByRole('button', { name: 'Clear input' }));

    expect(input).toHaveValue('');
    expect(screen.getByText('0/25 characters')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Clear input' }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('submits the entered word', async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const input = screen.getByPlaceholderText('Type here...');

    await user.type(input, 'testing');

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/submission/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: 'testing',
          participantId: 'participant-123',
        }),
      });
    });
  });

  it('does not add a participant when join_code is missing', async () => {
    mockGet.mockReturnValue(null);

    render(<UserPage />);

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
