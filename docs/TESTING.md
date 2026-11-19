# Testing guide

This project uses **[Vitest](https://vitest.dev)** as the test runner and
**[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**
for component tests.

## TL;DR

| Command                 | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `npm test`              | Watch mode: re-runs affected tests on every save           |
| `npm run test:run`      | Runs all tests once and exits (what CI does)               |
| `npm run test:coverage` | Runs once + coverage report → open `coverage/index.html`   |
| `npm run typecheck`     | TypeScript check of the app **and** the tests              |
| `npm run ci`            | Typecheck → tests + coverage → build. Same as the CI job   |

Useful extras:

```sh
npx vitest UnitConverter            # only files whose path matches "UnitConverter"
npx vitest -t "Fahrenheit"          # only tests whose name matches
npx vitest --ui                     # browser UI (needs: npm i -D @vitest/ui)
```

## Why Vitest instead of Jest?

The app is built with **Vite**. Jest has its own separate transform pipeline
(ts-jest/Babel) that knows nothing about Vite, which caused real problems here:

1. **`import.meta.env` crashed Jest.** `location.service.ts` and
   `image.service.ts` read API keys via `import.meta.env.VITE_*` (Vite's way of
   exposing env vars). ts-jest compiles to CommonJS, where `import.meta` is a
   syntax error, so those two suites **never ran at all**.
2. **Two configs to keep in sync.** Aliases, plugins, etc. had to be duplicated
   in `jest.config.js`.

Vitest *is* Vite under the hood: it reads `vite.config.ts`, so tests are
transformed exactly like the app. One config, native ESM/TypeScript/JSX,
`import.meta.env` just works. The API is almost identical to Jest
(`describe`, `it`, `expect`, `vi.fn()` ≈ `jest.fn()`).

### What the migration changed

| Jest                                    | Vitest                                      | Notes |
| --------------------------------------- | ------------------------------------------- | ----- |
| `jest.fn()`, `jest.spyOn()`             | `vi.fn()`, `vi.spyOn()`                     | Same behavior |
| `jest.Mock`, `jest.SpyInstance` types   | `Mock`, `MockInstance` (imported from `vitest`) | |
| globals (`describe` etc. just exist)    | explicit `import { describe, it } from 'vitest'` | Explicit imports: no magic, better editor support |
| `global.fetch = mockFetch`              | `vi.stubGlobal('fetch', mockFetch)`         | Auto-restored after each test |
| `process.env.PEXELS_API_KEY = '…'`      | `vi.stubEnv('VITE_PEXELS_API_KEY', '…')`    | ⚠️ See below |
| Mocking the `Date` constructor          | `vi.useFakeTimers()` + `vi.setSystemTime()` | See below |
| `jest.config.js`                        | `test: {…}` block in `vite.config.ts`       | |

**A bug the migration uncovered:** the old image/location tests set
`process.env.PEXELS_API_KEY`, but the code reads
`import.meta.env.VITE_PEXELS_API_KEY`. Different name, different object. Even if
those suites had loaded, they wouldn't have been testing what they claimed.
`vi.stubEnv()` patches `import.meta.env` directly.

**Controlling time:** `format.service.test.ts` used to replace `global.Date`
with a mock. Vitest won't let an arrow function be used as a constructor, and
replacing `Date` is brittle anyway. Fake timers are the standard approach:

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('says good morning at 8 AM', () => {
  vi.setSystemTime(new Date(2023, 0, 15, 8)); // "now" is 8 AM
  expect(formatService.getFormat().currentTime).toBe('morning');
});
```

## Where things live

```
vite.config.ts                    # `test:` block = Vitest config
app/scripts/test/setup.ts         # runs before every test file
app/scripts/services/*.test.ts    # unit tests for plain TS logic
app/scripts/components/*.test.tsx # component tests (React Testing Library)
api/tips.test.js                  # serverless function test (Node env)
```

> ⚠️ **`api/` gotcha:** Vercel turns *every* file in `api/` into a serverless
> function, so `api/tips.test.js` would be deployed as a public `/api/tips.test`
> endpoint. `.vercelignore` excludes `api/**/*.test.js` to prevent that.

Tests sit **next to the code they test** (`Foo.tsx` ↔ `Foo.test.tsx`), so
they're easy to find and move together.

## Configuration walkthrough (`vite.config.ts` → `test`)

| Option | Why |
| --- | --- |
| `environment: 'jsdom'` | Gives tests a fake `window`/`document`, needed to render React. `api/tips.test.js` overrides this with a `// @vitest-environment node` comment because it's server code. |
| `setupFiles` | Loads `setup.ts`: adds jest-dom matchers and unmounts components after each test. |
| `include` | Which files count as tests. |
| `unstubEnvs`, `unstubGlobals`, `restoreMocks` | Automatically undo `vi.stubEnv`, `vi.stubGlobal` and `vi.spyOn` after every test. This prevents test pollution, where one test's fake leaks into the next and causes flaky failures. |
| `reporters` (CI only) | Adds a JUnit XML report (`reports/junit.xml`), a standard format many CI tools understand. |
| `coverage` | Uses V8's built-in coverage. `json-summary` feeds the CI summary table; `html` is for you; `lcov` is the format services like Codecov read. |

## The three kinds of tests in this repo

### 1. Unit tests: services (`app/scripts/services/*.test.ts`)

Pure logic plus `fetch` calls. External APIs are **never hit**: `fetch` is
replaced with a `vi.fn()` that returns canned responses. That makes tests
fast, free, deterministic, and runnable in CI without API keys.

```ts
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);
mockFetch.mockResolvedValue({ ok: true, json: async () => ({ /* fake data */ }) });
```

### 2. Component tests (`app/scripts/components/*.test.tsx`)

Written with React Testing Library, whose guiding principle is:

> *The more your tests resemble the way your software is used, the more
> confidence they can give you.*

So we:

- **query like a user:** `screen.getByRole('button', { name: /celsius/i })`
  rather than CSS selectors or component internals;
- **act like a user:** `await userEvent.setup().click(button)`;
- **assert on what's visible:** `expect(el).toBeInTheDocument()` and
  `toHaveClass(...)` (matchers from `@testing-library/jest-dom`).

`TemperatureDisplay.test.tsx` also shows **dependency injection** paying off:
since the component receives `formatService` as a prop, the test can pass a
fake and assert on how it was called, with no module mocking.

### 3. API / serverless function test (`api/tips.test.js`)

A Vercel function is just `handler(request, response)`. The test builds a fake
`response` whose methods are spies (`status`, `json`, `setHeader`), calls the
handler, and checks the status code and body. Gemini is mocked via `fetch`.
It covers the happy path, CORS preflight, validation (400), a missing API key,
upstream failure and malformed AI output (generic 503), and the
Gemini request config (JSON mode, low thinking).

## Coverage: what the numbers mean

`npm run test:coverage` prints a table and writes `coverage/index.html`
(open it to see covered/uncovered lines highlighted in red/green).

- **Lines/Statements:** how much code executed during tests.
- **Branches:** whether both sides of each `if`/`?:`/`&&` were exercised.
  This is usually the most telling number.
- **Functions:** how many functions were called at least once.

Current state: services and the API are about 95–100% covered. Most remaining
gaps are UI components (`App.tsx`, `WeatherTips.tsx`, …). That's the obvious
next step if you want to raise the number. Coverage is a guide to *what's
untested*, not a goal in itself: 100% coverage with weak assertions is worse
than 70% with meaningful ones.

## Writing a new test: checklist

1. Create `Thing.test.ts(x)` next to `Thing.ts(x)`.
2. `import { describe, it, expect, vi } from 'vitest';`
3. Mock the network (`vi.stubGlobal('fetch', …)`) and env vars
   (`vi.stubEnv('VITE_…', …)`). Never call real APIs.
4. Arrange → Act → Assert. One behavior per `it`.
5. Run `npm test` and watch it go red → green.
