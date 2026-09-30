import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {},
}));

import { POST } from '@/app/api/participant/route';

describe('Participant API', () => {
  it('returns 400 when join code is missing', async () => {
    const request = new Request('http://localhost/api/participant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid join code');
  });
});
