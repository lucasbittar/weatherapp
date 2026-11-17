// @vitest-environment node
// ^ This serverless function runs on Node (on Vercel), not in a browser, so we
//   test it in Vitest's plain Node environment instead of the default jsdom.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from './tips.js';

// -----------------------------------------------------------------------------
// Testing a Vercel serverless function without Vercel
//
// The handler is just `(request, response) => ...`. We hand it a fake request
// object and a fake response object whose methods are `vi.fn()` spies, then
// assert on what the handler did with them (status code, JSON body, headers).
//
// The Gemini API is never actually called: `fetch` is replaced with a spy via
// `vi.stubGlobal`, so tests are fast, free, deterministic, and need no secrets.
// That's what lets them run in CI.
// -----------------------------------------------------------------------------

/** Builds a minimal fake of Vercel's response object. */
function createMockResponse() {
  const res = {
    statusCode: undefined,
    body: undefined,
    headers: {},
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value;
    }),
    // `status()` returns `res` so calls can be chained: res.status(200).json(...)
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data) => {
      res.body = data;
      return res;
    }),
    end: vi.fn(() => res),
  };
  return res;
}

const validBody = {
  temperature: 22,
  temperatureUnit: 'C',
  weatherSummary: 'Sunny',
  cityName: 'Lisbon',
  countryName: 'Portugal',
  humidity: 60,
  windSpeed: 5,
};

const validTips = {
  outfit: ['Sunglasses', 'Light shirt', 'Sneakers'],
  activities: ['Walk by the river', 'Picnic', 'Bike ride'],
  pointsOfInterest: ['Parks', 'Viewpoints', 'Outdoor cafes'],
};

/** Shapes a fake Gemini API response around the given model text. */
function geminiReply(text) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  };
}

describe('POST /api/tips', () => {
  let fetchMock;

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    // Keep the test output clean: the handler logs errors on purpose.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('answers CORS preflight requests with 200', async () => {
    const res = createMockResponse();
    await handler({ method: 'OPTIONS' }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects non-POST methods with 405', async () => {
    const res = createMockResponse();
    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual({ error: 'Method not allowed' });
  });

  it('returns 500 when GEMINI_API_KEY is not configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const res = createMockResponse();
    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'GEMINI_API_KEY not configured' });
  });

  // `it.each` with one row per missing field: the same test, three inputs.
  it.each(['temperature', 'weatherSummary', 'cityName'])(
    'returns 400 when "%s" is missing',
    async (field) => {
      const res = createMockResponse();
      const body = { ...validBody, [field]: undefined };
      await handler({ method: 'POST', body }, res);

      expect(res.statusCode).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it('returns the tips parsed from the Gemini response', async () => {
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));
    const res = createMockResponse();

    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(validTips);

    // Also check *what we sent* to Gemini: the API key and city made it in.
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('key=test-key');
    expect(JSON.parse(options.body).contents[0].parts[0].text).toContain('Lisbon, Portugal');
  });

  it('strips ```json markdown fences the model sometimes adds', async () => {
    fetchMock.mockResolvedValue(geminiReply('```json\n' + JSON.stringify(validTips) + '\n```'));
    const res = createMockResponse();

    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(validTips);
  });

  it('returns 500 when the Gemini API call fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' });
    const res = createMockResponse();

    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Failed to generate tips');
    expect(res.body.details).toContain('rate limited');
  });

  it('returns 500 when the model replies with an incomplete structure', async () => {
    fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ outfit: ['Hat'] })));
    const res = createMockResponse();

    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.details).toBe('Invalid response structure from AI');
  });
});
