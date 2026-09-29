import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {},
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
  })),
}));

import { POST, PATCH } from '@/app/api/session/route';

describe('Session API', () => {
  it('returns 400 when session name is empty', async () => {
    const request = new Request('http://localhost/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid session name');
  });

  it('returns 400 when session state is invalid', async () => {
    const request = new Request('http://localhost/api/session', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: 'invalid',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid session state');
  });

  it('returns 401 when host token is missing', async () => {
    const request = new Request('http://localhost/api/session', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: 'paused',
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Host token missing');
  });
});
