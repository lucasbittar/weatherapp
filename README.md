# Weather App #
[![CI/CD](https://github.com/lucasbittar/weatherapp/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasbittar/weatherapp/actions/workflows/ci.yml)

Simple and basic weather app.
This app is a way I can keep up-to-date to the technology as it evolves.
I started it 10 years ago as a General Assembly class project and it's become my experimental sandbox.

I've written it in vanilla JS (spaghetti code) with Bower and Grunt as build tools, later on I converted it into a modular code approach using jQuery and finally with the help of Jules by Google I was able to rewrite the entire app in React and TypeScript using the latests tools there are out there.

### Project link ###
[Launch Project]

### Development ###

```sh
npm install
npm run dev            # start the app at http://localhost:8080
npm test               # tests in watch mode
npm run ci             # typecheck + tests with coverage + build (what CI runs)
```

### Testing & CI/CD ###
* Tests: [Vitest](https://vitest.dev) + React Testing Library. See [docs/TESTING.md](docs/TESTING.md)
* API hardening (rate limiting, origin checks, error handling): see [docs/API-SECURITY.md](docs/API-SECURITY.md)
* Pipeline: GitHub Actions runs typecheck, tests and build on every PR and push to `master`, then deploys to Vercel (preview URL for PRs, production for `master`). See [docs/CI-CD.md](docs/CI-CD.md)

### Update ###

#### Nov 2026
* Migrate tests from Jest to Vitest (fixes 2 suites that couldn't run because of `import.meta.env`)
* Add component tests (React Testing Library) and serverless API tests
* Add GitHub Actions CI/CD pipeline with test-gated Vercel deploys


#### Jan 2026
* Complete UI revamp with retro CRT terminal aesthetic
* Add multi-line ASCII art weather icons
* Implement unified CSS border frame design
* Add amber phosphor color theme with colorful accents
* Integrate Gemini AI for personalized weather-based recommendations
  - What to wear suggestions
  - Activity recommendations
  - Nearby points of interest
* Add colorful ATMOSPHERIC_SENSORS display (wind, humidity, actual temp)
* Add live time indicator with pulsing dot
* Improve mobile experience with scrollable content
* Add favicon set with multi-device support (iOS, Android, desktop)
* Switch from pnpm to npm

#### Jun 2025
* Complete rewrite in React and TypeScript
* Introducing tools like TanStack Query for fetching data from the server
* Implementing recently learned code best practices at Frontend Masters workshop by the amazing David K.
* Add unit tests to services logic
* Update GeoLocation API provider from AccuWeather to OpenCage

#### Sometime back in 2020
* Complete code refactor using Modular Javascript Design Pattern
* Replace Grunt with webpack
* Improved search image API

### TO-DO
* ~~Find a good way to deal with env files in GH-pages~~
* No such thing as a "good way to deal with env files in GH pages" unfortunately
* Setup project to be deployed by Vercel (for now)
* Increase test coverage (UI components like `App`, `WeatherTips`)

### Wishlist
* Setup project to be deployed by my own server

Still a lot to come hopefully

[Launch Project]: https://weatherapp-lucas-bittar-magnanis-projects.vercel.app/ "WeatherApp"
