import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Home from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('next/form', () => ({
  default: ({
    children,
    action,
    ...props
  }: {
    children: React.ReactNode;
    action: () => void;
  }) => (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        action();
      }}>
      {children}
    </form>
  ),
}));

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: 'WordCloud' }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Give your session a topic to get started'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'startStart' }),
    ).toBeInTheDocument();
  });

  it('does not start a session when the subject is empty', async () => {
    const user = userEvent.setup();

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({} as Response);

    render(<Home />);

    const button = screen.getByRole('button', {
      name: 'startStart',
    });

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await user.click(button);

    expect(consoleError).toHaveBeenCalledWith('Subject is required');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();

    consoleError.mockRestore();
    fetchMock.mockRestore();
  });

  it('starts a session and navigates to the host page', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          id: '123',
        }),
      }),
    );

    render(<Home />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', {
      name: 'startStart',
    });

    await user.type(input, 'React Testing');

    await user.click(button);

    expect(fetch).toHaveBeenCalledWith('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'React Testing',
      }),
    });

    expect(pushMock).toHaveBeenCalledWith('/host/123');
  });
});
