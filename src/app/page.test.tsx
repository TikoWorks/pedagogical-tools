import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the page', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: 'Create a cloud' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Give your cloud a topic to get started'),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('does not start a session when the subject is empty', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<Home />);

    const button = screen.getByRole('button', { name: 'Start' });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('starts a session and navigates to the host page', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: '123',
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<Home />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: 'Start' });

    await user.type(input, 'React Testing');
    await user.click(button);

    expect(fetchMock).toHaveBeenCalledWith('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'React Testing',
      }),
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/host/123');
    });
  });

  it('shows an error when session creation fails', async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    vi.stubGlobal('fetch', fetchMock);

    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      render(<Home />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: 'Start' });

      await user.type(input, 'React Testing');
      await user.click(button);

      expect(
        await screen.findByText('Could not start a game. Please try again.'),
      ).toBeInTheDocument();

      expect(button).toBeEnabled();
      expect(pushMock).not.toHaveBeenCalled();
    } finally {
      consoleErrorMock.mockRestore();
    }
  });
});
