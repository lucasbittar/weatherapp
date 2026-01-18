// TODO: Re-enable when Gemini API key is properly configured
// Uses Google Gemini API (free tier: 60 requests/minute)
// Get API key at: https://aistudio.google.com/apikey

module.exports = async function handler(request, response) {
  // Set CORS headers for all responses
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return response.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const body = request.body;
    const {
      temperature,
      temperatureUnit,
      weatherSummary,
      cityName,
      stateName,
      countryName,
      humidity,
      windSpeed,
    } = body;

    if (!temperature || !weatherSummary || !cityName) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    const locationStr = [cityName, stateName, countryName]
      .filter(Boolean)
      .join(', ');

    const prompt = `Based on the current weather conditions, provide helpful tips for someone in ${locationStr}.

Weather conditions:
- Temperature: ${temperature}°${temperatureUnit}
- Conditions: ${weatherSummary}
${humidity !== undefined ? `- Humidity: ${humidity}%` : ''}
${windSpeed !== undefined ? `- Wind speed: ${windSpeed} mph` : ''}

Please provide practical tips in JSON format with exactly these three arrays:
1. "outfit": 3 specific clothing/accessory suggestions for this weather
2. "activities": 3 activity suggestions that are great for this weather
3. "pointsOfInterest": 3 types of places worth visiting in ${cityName} given the weather

Keep each suggestion concise (under 15 words). Be specific and practical.

Respond ONLY with valid JSON in this exact format, no markdown or code blocks:
{"outfit":["item1","item2","item3"],"activities":["activity1","activity2","activity3"],"pointsOfInterest":["place1","place2","place3"]}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error status:', geminiResponse.status);
      console.error('Gemini API error body:', errorText);
      throw new Error(`Gemini API request failed: ${errorText}`);
    }

    const message = await geminiResponse.json();

    // Extract text content from the response
    const textContent = message.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('No text content in response');
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

    // Parse the JSON response
    const tips = JSON.parse(cleanedText);

    // Validate the response structure
    if (!tips.outfit || !tips.activities || !tips.pointsOfInterest) {
      throw new Error('Invalid response structure from AI');
    }

    return response.status(200).json(tips);
  } catch (error) {
    console.error('Error generating tips:', error);
    return response.status(500).json({
      error: 'Failed to generate tips',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
