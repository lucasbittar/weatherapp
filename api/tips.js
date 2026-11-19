// Weather tips endpoint, powered by Google Gemini.
// Get an API key at https://aistudio.google.com/apikey
//
// Hardening (see docs/API-SECURITY.md):
//   1. Same-origin only: browsers on other websites can't call this endpoint.
//   2. Strict input validation: bounded strings and real numbers, so nobody can
//      stuff a huge prompt in and burn Gemini tokens.
//   3. Generic errors: upstream/config details are logged server-side, never
//      sent to the client.
//   4. Rate limiting is NOT done here. It lives in the Vercel Firewall, in
//      front of the function, so blocked requests never run (and cost nothing).

const MAX_TEXT_LENGTH = 100;

// Google retires old models: gemini-2.0-flash started returning 404 in Nov 2026.
// When that happens again, the function logs show a 404 naming the replacement.
// List the current ones with:
//   curl -H "x-goog-api-key: $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1beta/models
const GEMINI_MODEL = 'gemini-3.8-flash';

// What clients see whenever something goes wrong on *our* side. 503 = "temporary,
// try again later", which is honest for an out-of-credits or flaky upstream API.
const UNAVAILABLE = { error: 'Tips are temporarily unavailable' };

/**
 * Is this request coming from our own frontend?
 *
 * Browsers attach an `Origin` header to cross-site requests and to same-site
 * POSTs. If it's present, it must match the host this function is served from.
 * That works for production, every preview URL, custom domains and `vercel dev`
 * without maintaining an allowlist.
 *
 * Requests without `Origin` (curl, scripts) are allowed through: `Origin` is a
 * browser safeguard, not authentication. Those clients are handled by the
 * firewall rate limit instead.
 */
function isAllowedOrigin(request) {
  const origin = request.headers?.origin;
  if (!origin) return true;

  const host = request.headers['x-forwarded-host'] || request.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false; // malformed Origin header
  }
}

const isShortText = (value) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT_LENGTH;
const isOptionalShortText = (value) => value === undefined || value === null || isShortText(value);
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isOptionalNumber = (value) => value === undefined || value === null || isFiniteNumber(value);

/** Returns an error message for an invalid body, or null if it's fine. */
function validate(body) {
  if (!body || typeof body !== 'object') return 'Request body must be JSON';

  // NOTE: `!temperature` would wrongly reject 0°. Check the type instead.
  if (!isFiniteNumber(body.temperature)) return 'temperature must be a number';
  if (!['C', 'F'].includes(body.temperatureUnit)) return 'temperatureUnit must be "C" or "F"';
  if (!isShortText(body.weatherSummary)) return `weatherSummary must be 1-${MAX_TEXT_LENGTH} characters`;
  if (!isShortText(body.cityName)) return `cityName must be 1-${MAX_TEXT_LENGTH} characters`;
  if (!isOptionalShortText(body.stateName)) return `stateName must be at most ${MAX_TEXT_LENGTH} characters`;
  if (!isOptionalShortText(body.countryName)) return `countryName must be at most ${MAX_TEXT_LENGTH} characters`;
  if (!isOptionalNumber(body.humidity)) return 'humidity must be a number';
  if (!isOptionalNumber(body.windSpeed)) return 'windSpeed must be a number';
  return null;
}

module.exports = async function handler(request, response) {
  // Deliberately no `Access-Control-Allow-Origin` header: without it, browsers
  // refuse to let other websites read our responses, and cross-origin
  // preflights (OPTIONS) fail. Our own frontend is same-origin and needs none.
  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(request)) {
    return response.status(403).json({ error: 'Forbidden' });
  }

  // Validation errors are the caller's fault and contain no secrets, so it's
  // fine (and helpful) to say exactly what's wrong.
  const validationError = validate(request.body);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[tips] GEMINI_API_KEY is not set');
    return response.status(503).json(UNAVAILABLE);
  }

  try {
    const {
      temperature,
      temperatureUnit,
      weatherSummary,
      cityName,
      stateName,
      countryName,
      humidity,
      windSpeed,
    } = request.body;

    const locationStr = [cityName, stateName, countryName]
      .filter(Boolean)
      .join(', ');

    const prompt = `Based on the current weather conditions, provide helpful tips for someone in ${locationStr}.

Weather conditions:
- Temperature: ${temperature}°${temperatureUnit}
- Conditions: ${weatherSummary}
${isFiniteNumber(humidity) ? `- Humidity: ${humidity}%` : ''}
${isFiniteNumber(windSpeed) ? `- Wind speed: ${windSpeed} mph` : ''}

Please provide practical tips in JSON format with exactly these three arrays:
1. "outfit": 3 specific clothing/accessory suggestions for this weather
2. "activities": 3 activity suggestions that are great for this weather
3. "pointsOfInterest": 3 types of places worth visiting in ${cityName} given the weather

Keep each suggestion concise (under 15 words). Be specific and practical.

Respond ONLY with valid JSON in this exact format, no markdown or code blocks:
{"outfit":["item1","item2","item3"],"activities":["activity1","activity2","activity3"],"pointsOfInterest":["place1","place2","place3"]}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Header instead of `?key=` in the URL: URLs end up in logs.
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            // Gemini 3.x models "think" before answering, and thinking tokens
            // count against maxOutputTokens. On the default level the model
            // used ~480 of our 500 tokens thinking and the JSON got cut off.
            // A short list of tips needs no deep reasoning, so keep it low.
            thinkingConfig: { thinkingLevel: 'low' },
            // JSON mode: the model returns raw JSON, no ```json fences.
            // (We still strip fences below, just in case.)
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API request failed (${geminiResponse.status}): ${errorText}`);
    }

    const message = await geminiResponse.json();

    // Extract text content from the response
    const textContent = message.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('No text content in Gemini response');
    }

    // Clean up the response (remove markdown code blocks if present)
    let cleanedText = textContent.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const tips = JSON.parse(cleanedText);

    // Validate the response structure
    if (!Array.isArray(tips.outfit) || !Array.isArray(tips.activities) || !Array.isArray(tips.pointsOfInterest)) {
      throw new Error('Invalid response structure from AI');
    }

    return response.status(200).json({
      outfit: tips.outfit,
      activities: tips.activities,
      pointsOfInterest: tips.pointsOfInterest,
    });
  } catch (error) {
    // Full details go to the function logs (Vercel dashboard → Logs, or
    // `vercel logs <deployment-url>`), never to the client.
    console.error('[tips] Failed to generate tips:', error instanceof Error ? error.message : error);
    return response.status(503).json(UNAVAILABLE);
  }
};
