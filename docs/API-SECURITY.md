# Securing `/api/tips`

`/api/tips` calls Google Gemini with **our** API key, and every call costs
credits. On Nov 17, 2026 the prepaid credits ran out and the endpoint started
returning 500s with Google's raw billing error inside. This doc explains the
layers that now protect it.

```
            request
               │
               ▼
┌──────────────────────────────┐
│ 1. Vercel Firewall           │  rate limit: 10 POSTs / minute / IP
│    (before the function)     │  blocked requests never run → cost nothing
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ 2. Origin check   (tips.js)  │  other websites → 403
│ 3. Input checks   (tips.js)  │  bad or oversized input → 400, no Gemini call
└──────────────┬───────────────┘
               ▼
          Gemini API
               │ fails?
               ▼
┌──────────────────────────────┐
│ 4. Generic errors (tips.js)  │  client gets 503 "temporarily unavailable"
│                              │  details only in the function logs
└──────────────────────────────┘
```

## 1. Rate limiting: Vercel Firewall

**Why not in the code?** A counter inside the function lives in that one
function instance's memory. Vercel runs several instances, in several regions,
and recycles them, so an in-code limit is easy to get around. The firewall sits
**in front of** all of them, and requests it blocks never invoke the function
(no compute, no Gemini call, and Vercel doesn't bill blocked traffic).

The rule (managed with the Vercel CLI, not stored in this repo):

| Setting | Value |
| --- | --- |
| Name | `Rate limit tips API` |
| Match | `path = /api/tips` **and** `method = POST` |
| Limit | 10 requests per 60 s, fixed window |
| Counted by | client IP |
| When exceeded | `log` at first, then `rate_limit` (HTTP 429) |

Why 10/min: the frontend asks for tips about once per page load (React
Query caches them for 30 min and retries once), so a real visitor makes 1–2
calls. 10/min leaves plenty of room for refreshes or several people behind one
office/mobile IP, while a script hammering the endpoint gets cut off fast.

Counters are **per region**, so a client spread across N regions could get up
to ~N× the limit. That's fine for this use case.

### Rolling it out safely

A firewall rule applies to *every* request, so new rules go through stages
(`vercel` below = the latest CLI, e.g. `npx vercel@latest`; the version pinned
in package.json predates `vercel firewall`):

1. **Log only:** the rule records what it *would* block, but blocks nothing.
   ```sh
   vercel firewall diff              # review the staged change
   vercel firewall publish --yes     # make it live
   ```
2. **Watch real traffic** for a day or two in the dashboard:
   Project → **Firewall** → filter by the rule. Only scripted bursts should
   show up, never normal visitors.
3. **Enforce:**
   ```sh
   vercel firewall rules edit "Rate limit tips API" \
     --condition '{"type":"path","op":"eq","value":"/api/tips"}' \
     --condition '{"type":"method","op":"eq","value":"POST"}' \
     --action rate_limit --rate-limit-window 60 --rate-limit-requests 10 \
     --rate-limit-keys ip --rate-limit-action rate_limit --yes
   vercel firewall publish --yes
   ```
   (`edit --condition` replaces *all* conditions, so both are repeated.)
4. **Roll back** if real users get 429s:
   `vercel firewall rules disable "Rate limit tips API"` + `publish`.

Check what's live at any time: `vercel firewall rules list --expand`.

## 2. Origin check: same-site browsers only

Before: `Access-Control-Allow-Origin: *`, which let **any website** call our
endpoint from its visitors' browsers (and spend our credits).

Now there's no CORS header at all, plus an explicit check:

- Browsers send an `Origin` header on cross-site requests and same-site POSTs.
- If it's present, it must match the host the function is served from
  (`x-forwarded-host` or `host`). That covers production, every preview URL,
  custom domains and `vercel dev`, so there's no allowlist to maintain.
- Mismatch or malformed → **403**, before Gemini is ever called.

**What it doesn't do:** `curl` or a script can simply omit or fake `Origin`.
CORS and Origin checks protect against *other websites*, not against
determined scripts. That's what layer 1 (rate limiting) is for. Defense in
depth means each layer covers a different threat.

## 3. Input validation

Everything that ends up in the Gemini prompt is checked first:

- `temperature`: a finite **number** (the old `!temperature` check wrongly
  rejected **0°**).
- `temperatureUnit`: `"C"` or `"F"`.
- Text fields: non-empty strings of **at most 100 characters**, so nobody can
  stuff a novel into the prompt and burn tokens.
- `humidity`, `windSpeed`: numbers, if present.

Failures return **400** with a specific message. That's safe, since it only
describes the caller's own input.

## 4. Generic errors, details in logs

Before, any failure returned **500** with `details` holding Google's raw error
message (billing status, project info…). Now every failure on our side
(missing key, Gemini error, network error, malformed AI output) returns:

```http
HTTP/1.1 503 Service Unavailable
{"error":"Tips are temporarily unavailable"}
```

- **503** means "temporary, try later", which fits better than a generic 500.
- The real reason is written with `console.error('[tips] …')` and shows up in
  Vercel → Project → **Logs** (or `vercel logs <deployment-url>`).
- The UI already hides the tips panel on any error, so users just don't see
  tips. Nothing breaks.

Also: the API key now travels in the `x-goog-api-key` header instead of a
`?key=` query parameter, because URLs tend to end up in logs and error messages.

## Tests

`api/tips.test.js` covers every layer in code: origin (403), each validation
rule (400, and Gemini is never called), every failure mode (503, nothing
leaked, details logged) and the 0° regression. The firewall rule isn't code,
so it's verified in the dashboard (step 2 above).
