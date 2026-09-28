import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {},
}));

import { POST } from '@/app/api/submission/route';

describe('Submission API', () => {
  it('returns 400 when participant ID is missing', async () => {
    const request = new Request('http://localhost/api/submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          word: 'test',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid participant ID');
  });

  it('returns 400 when submission data is missing', async () => {
    const request = new Request('http://localhost/api/submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantId: 'test-participant-id',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid submission data');
  });
});
