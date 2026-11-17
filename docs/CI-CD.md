# CI/CD with GitHub Actions + Vercel

This doc explains the pipeline in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):
what it does, why it's built this way, and the one-time setup it needs.

## What CI/CD means here

- **CI (Continuous Integration):** every push and pull request is automatically
  typechecked, tested and built on a clean machine. If anything fails, you
  find out in minutes, before it's merged.
- **CD (Continuous Deployment):** when the checks pass, the code is
  deployed automatically: pull requests get a **preview URL**, merges to
  `master` go to **production**.

The key idea is the **gate**: deploy jobs declare `needs: test`, so a red
test run means nothing ships.

## The pipeline

```
 push / PR
    │
    ▼
┌───────────────────────────────┐
│ test                          │  runs on every push to master, every PR,
│  1. checkout                  │  and manually ("Run workflow" button)
│  2. setup Node (from .nvmrc)  │
│  3. npm ci                    │
│  4. typecheck                 │
│  5. tests + coverage          │──▶ coverage table on the run Summary page
│  6. upload reports            │──▶ downloadable "test-reports" artifact
│  7. vite build                │
└───────────────┬───────────────┘
                │ only if green ✅
        ┌───────┴────────┐
        ▼                ▼
┌───────────────┐ ┌──────────────────┐
│deploy-preview │ │deploy-production │
│ (PRs only)    │ │ (master only)    │
│ vercel pull   │ │ vercel pull      │
│ vercel build  │ │ vercel build     │
│ vercel deploy │ │ vercel deploy    │
│ → PR comment  │ │   --prod         │
│   with URL    │ │                  │
└───────────────┘ └──────────────────┘
```

### Trigger rules

| Event | test | deploy-preview | deploy-production |
| --- | :-: | :-: | :-: |
| Pull request (from this repo) | ✅ | ✅ | |
| Pull request from a fork | ✅ | ⏭️ (no secrets for forks) | |
| Push to `master` (incl. merged PRs) | ✅ | | ✅ |
| Push to another branch, no PR | | | |
| Manual "Run workflow" | ✅ | | ✅ if run on master |

## Concepts worth knowing (all used in the workflow)

| Concept | Where | What it does |
| --- | --- | --- |
| `on:` triggers | top | Which events start the workflow. |
| **Jobs** and **steps** | `jobs:` | Jobs run on separate fresh VMs (in parallel unless linked by `needs`). Steps run in order inside a job. |
| `needs:` | deploy jobs | Dependency between jobs. This is the quality gate. |
| `if:` | deploy jobs | Conditionally run a job (e.g. only on `master`). |
| `uses:` | steps | Run a reusable **action** from the marketplace, e.g. `actions/checkout@v5`. The `@v5` pins a major version. |
| `npm ci` | install | Clean, exact install from `package-lock.json`. Fails if the lock is stale, which is what you want in CI. |
| `cache: npm` | setup-node | Reuses downloaded packages across runs, so installs are faster. |
| `concurrency:` | top + prod | Cancels superseded PR runs; serializes production deploys so they never overlap or get cut off. |
| `permissions:` | top + preview | The auto-provided `GITHUB_TOKEN` is read-only by default; only the preview job gets `pull-requests: write` to comment. Least privilege. |
| **Secrets** | `${{ secrets.X }}` | Encrypted values; masked as `***` in logs. Not exposed to fork PRs. |
| **Step outputs** | `$GITHUB_OUTPUT` | Pass data (the deploy URL) from one step to later ones. |
| **Job summary** | `$GITHUB_STEP_SUMMARY` | Markdown shown on the run page (coverage table, prod URL). |
| **Artifacts** | `upload-artifact` | Files kept after the run (coverage HTML, JUnit XML). |
| **Environments** | `environment:` | Named targets (`preview`, `production`) with a deploy history in the repo sidebar, and optional protection rules such as required reviewers. |
| `if: always()` | coverage steps | Run even if a previous step failed, so you still get the report. |

## Why deploy from GitHub Actions instead of Vercel's Git integration?

Vercel can auto-deploy every push by itself, and that's what this project did
before. But Vercel deploys **regardless of whether tests pass**. Driving the
deploy from Actions gives you:

- **Test-gated deploys:** production only changes when the suite is green.
- **One visible pipeline:** test → build → deploy in a single place, with
  history under the repo's *Environments* and *Actions* tabs.

To avoid **double deploys** (Vercel's integration *and* Actions), `vercel.json` now has:

```json
"git": { "deploymentEnabled": false }
```

This turns off Vercel's automatic Git deployments; Actions is the only thing
that deploys. (The GitHub ↔ Vercel connection stays; it just doesn't
trigger builds.)

> ⚠️ Because of this, **once this lands on `master`, nothing deploys until
> the secrets below are configured.** Do the setup first.

### How the Vercel CLI steps work

```sh
vercel pull --yes --environment=production   # fetch project settings + env vars (API keys) into .vercel/
vercel build --prod                          # run `npm run build` on the CI machine → .vercel/output
vercel deploy --prebuilt --prod              # upload the prebuilt output; Vercel doesn't rebuild
```

The build happens on GitHub's runner, using the env vars stored in your
Vercel project (`VITE_PEXELS_API_KEY`, `VITE_OPEN_CAGE_API_KEY`,
`GEMINI_API_KEY`, …). You keep managing those in the Vercel dashboard or via
`vercel env`; **they don't need to be GitHub secrets.**

## One-time setup

### 1. Get the three Vercel values

| Secret | Where to find it |
| --- | --- |
| `VERCEL_TOKEN` | vercel.com → Account Settings → **Tokens** → Create. Scope it to your team, and give it an expiration. |
| `VERCEL_ORG_ID` | `orgId` in your local `.vercel/project.json` (created by `vercel link`). |
| `VERCEL_PROJECT_ID` | `projectId` in the same file. |

```sh
cat .vercel/project.json   # shows orgId and projectId
```

### 2. Add them to GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**,
once for each of the three. Or with the GitHub CLI (it prompts for the value,
so it never lands in your shell history):

```sh
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### 3. (Optional) Protect production

Repo → **Settings → Environments → production** → *Required reviewers*.
Every production deploy will then pause until you click **Approve**, a nice
thing to demo.

### 4. (Optional) Require green CI before merging

Repo → **Settings → Branches → Add rule** for `master` → *Require status
checks to pass* → select **Typecheck, test & build**. Now GitHub won't let
a PR merge until the tests pass.

## Running the pipeline locally

You don't need to push to know whether CI will pass:

```sh
npm run ci                 # typecheck → tests + coverage → build (same as the test job)
actionlint                 # lint the workflow YAML (brew install actionlint)
```

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `npm ci` fails with "lock file out of sync" | You changed `package.json` without updating the lock file. Run `npm install` and commit `package-lock.json`. |
| Deploy step: "No existing credentials found" / 403 | `VERCEL_TOKEN` missing, expired or lacking access to the team. |
| Deploy step: "Project not found" | `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` wrong or swapped. |
| Preview job skipped on a PR | PR is from a fork (no secrets), or the `test` job failed. |
| App deploys but API keys are empty | Env vars not set for that environment (Preview vs Production) in Vercel. |
| A `*.test` URL shows up under `/api/` | A test file in `api/` isn't covered by `.vercelignore`. |
| Two deployments per push | `git.deploymentEnabled: false` isn't on the deployed branch yet. |
