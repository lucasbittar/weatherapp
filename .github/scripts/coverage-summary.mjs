// Turns Vitest's coverage/coverage-summary.json into a Markdown table.
//
// In CI the output is appended to $GITHUB_STEP_SUMMARY, which GitHub renders
// on the workflow run's Summary page. Try it locally:
//
//   npm run test:coverage && node .github/scripts/coverage-summary.mjs
import { existsSync, readFileSync } from 'node:fs';

const file = 'coverage/coverage-summary.json';

if (!existsSync(file)) {
  console.log('## 🧪 Test coverage\n\n_No coverage report found (did the tests run?)._');
  process.exit(0);
}

const { total } = JSON.parse(readFileSync(file, 'utf8'));
const metrics = ['lines', 'statements', 'functions', 'branches'];

console.log(
  [
    '## 🧪 Test coverage',
    '',
    '| Metric | % | Covered |',
    '|---|---:|---:|',
    ...metrics.map((m) => `| ${m} | ${total[m].pct}% | ${total[m].covered}/${total[m].total} |`),
  ].join('\n')
);
