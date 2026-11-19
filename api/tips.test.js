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

const HOST = 'weatherapp.vercel.app';

/** A request as our own frontend would send it (same-origin POST). */
function createRequest({ body = validBody, method = 'POST', headers = {} } = {}) {
  return {
    method,
    body,
    headers: { host: HOST, origin: `https://${HOST}`, ...headers },
  };
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

const UNAVAILABLE = { error: 'Tips are temporarily unavailable' };

/** Shapes a fake Gemini API response around the given model text. */
function geminiReply(text) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  };
}

describe('POST /api/tips', () => {
  let fetchMock;
  let consoleError;

  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    // Keep the test output clean (the handler logs errors on purpose), and
    // keep a handle on the spy to check *what* gets logged.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('happy path', () => {
    it('returns the tips parsed from the Gemini response', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));
      const res = createMockResponse();

      await handler(createRequest(), res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(validTips);
    });

    it('sends the API key in a header, not in the URL (URLs end up in logs)', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));

      await handler(createRequest(), createMockResponse());

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).not.toContain('test-key');
      expect(options.headers['x-goog-api-key']).toBe('test-key');
      expect(JSON.parse(options.body).contents[0].parts[0].text).toContain('Lisbon, Portugal');
    });

    // Regression test: with Gemini 3.x, default "thinking" ate the whole token
    // budget and truncated the JSON. Both settings below are needed.
    it('asks for JSON output with low thinking so the answer fits the token budget', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));

      await handler(createRequest(), createMockResponse());

      const { generationConfig } = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(generationConfig.responseMimeType).toBe('application/json');
      expect(generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' });
    });

    it('strips ```json markdown fences the model sometimes adds', async () => {
      fetchMock.mockResolvedValue(geminiReply('```json\n' + JSON.stringify(validTips) + '\n```'));
      const res = createMockResponse();

      await handler(createRequest(), res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(validTips);
    });

    it('only returns the three expected fields, even if the model adds more', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ ...validTips, extra: 'surprise' })));
      const res = createMockResponse();

      await handler(createRequest(), res);

      expect(Object.keys(res.body)).toEqual(['outfit', 'activities', 'pointsOfInterest']);
    });

    // Regression test: the old `if (!temperature)` check treated 0 as missing.
    it('accepts a temperature of 0°', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));
      const res = createMockResponse();

      await handler(createRequest({ body: { ...validBody, temperature: 0 } }), res);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('HTTP method & CORS', () => {
    it('answers preflight with 204 and does NOT grant cross-origin access', async () => {
      const res = createMockResponse();
      await handler(createRequest({ method: 'OPTIONS' }), res);

      expect(res.statusCode).toBe(204);
      // No Access-Control-Allow-Origin header = browsers block other sites.
      expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects non-POST methods with 405 and an Allow header', async () => {
      const res = createMockResponse();
      await handler(createRequest({ method: 'GET' }), res);

      expect(res.statusCode).toBe(405);
      expect(res.headers.Allow).toBe('POST');
    });
  });

  describe('origin check', () => {
    it('rejects requests from another website with 403', async () => {
      const res = createMockResponse();
      await handler(createRequest({ headers: { origin: 'https://evil.example' } }), res);

      expect(res.statusCode).toBe(403);
      expect(fetchMock).not.toHaveBeenCalled(); // no Gemini credits spent
    });

    it('rejects a malformed Origin header', async () => {
      const res = createMockResponse();
      await handler(createRequest({ headers: { origin: 'not a url' } }), res);

      expect(res.statusCode).toBe(403);
    });

    it('matches against x-forwarded-host when a proxy sets it', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));
      const res = createMockResponse();
      await handler(
        createRequest({
          headers: { host: 'internal.host', 'x-forwarded-host': 'my-app.com', origin: 'https://my-app.com' },
        }),
        res
      );

      expect(res.statusCode).toBe(200);
    });

    it('lets non-browser clients (no Origin header) through to validation', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify(validTips)));
      const res = createMockResponse();
      await handler({ method: 'POST', body: validBody, headers: { host: HOST } }, res);

      // These are throttled by the Vercel Firewall rate limit, not here.
      expect(res.statusCode).toBe(200);
    });
  });

  describe('input validation', () => {
    // `it.each` with one row per bad input: the same test, many cases.
    it.each([
      ['temperature missing', { temperature: undefined }],
      ['temperature as a string', { temperature: '22' }],
      ['temperature NaN', { temperature: NaN }],
      ['invalid unit', { temperatureUnit: 'K' }],
      ['weatherSummary missing', { weatherSummary: undefined }],
      ['weatherSummary blank', { weatherSummary: '   ' }],
      ['cityName missing', { cityName: undefined }],
      ['cityName too long', { cityName: 'x'.repeat(101) }],
      ['countryName too long', { countryName: 'x'.repeat(101) }],
      ['stateName not a string', { stateName: 42 }],
      ['humidity not a number', { humidity: 'humid' }],
      ['windSpeed not a number', { windSpeed: {} }],
    ])('returns 400 for %s', async (_label, override) => {
      const res = createMockResponse();
      await handler(createRequest({ body: { ...validBody, ...override } }), res);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toEqual(expect.any(String));
      expect(fetchMock).not.toHaveBeenCalled(); // bad input never costs tokens
    });

    it('returns 400 when there is no body', async () => {
      const res = createMockResponse();
      // `null`, not `undefined`: undefined would trigger the default parameter
      // in createRequest() and silently send a valid body.
      await handler(createRequest({ body: null }), res);

      expect(res.statusCode).toBe(400);
    });
  });

  // Every failure on our side returns the same generic 503. The real reason is
  // logged server-side, so we assert BOTH: what the client sees, and what's logged.
  describe('server-side failures (generic 503, details only in logs)', () => {
    it('when GEMINI_API_KEY is not configured', async () => {
      vi.stubEnv('GEMINI_API_KEY', '');
      const res = createMockResponse();
      await handler(createRequest(), res);

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual(UNAVAILABLE);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('GEMINI_API_KEY'));
    });

    it('when Gemini rejects the request (e.g. out of credits)', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 402,
        text: async () => '{"error":{"message":"Your prepayment credits are depleted."}}',
      });
      const res = createMockResponse();
      await handler(createRequest(), res);

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual(UNAVAILABLE); // no upstream details leaked
      expect(consoleError).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('prepayment credits are depleted')
      );
    });

    it('when the network call itself throws', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNRESET'));
      const res = createMockResponse();
      await handler(createRequest(), res);

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual(UNAVAILABLE);
    });

    it('when the model replies with invalid JSON', async () => {
      fetchMock.mockResolvedValue(geminiReply('Sure! Here are some tips: wear a hat.'));
      const res = createMockResponse();
      await handler(createRequest(), res);

      expect(res.statusCode).toBe(503);
      expect(res.body).toEqual(UNAVAILABLE);
    });

    it('when the model replies with an incomplete structure', async () => {
      fetchMock.mockResolvedValue(geminiReply(JSON.stringify({ outfit: ['Hat'] })));
      const res = createMockResponse();
      await handler(createRequest(), res);

      expect(res.statusCode).toBe(503);
      expect(consoleError).toHaveBeenCalledWith(expect.any(String), 'Invalid response structure from AI');
    });
  });
});
