# Dependency Modernization Notes

Verified on 2026-06-27.

## Current State

This project is a Next.js 12 Pages Router app with one API route that downloads a remote image, reads its dimensions, renders via `canvas`, applies k-means color reduction, and returns PNG/JPEG output.

Current direct runtime dependencies:

| Package | Current | Latest checked | Assessment |
| --- | ---: | ---: | --- |
| `next` | 12.0.7 | 16.2.9 | Major framework migration required. Latest requires Node >=20.9 and React 18.2/19. |
| `react`, `react-dom` | 17.0.2 | 19.2.7 | Must move with Next, not independently. |
| `canvas` | 2.6.1 | 3.2.3 | Native dependency risk. Current version uses old `nan`/`node-pre-gyp`; latest still depends on native binaries/build behavior. |
| `axios` | 0.24.0 | 1.18.1 | Security risk; better to remove and use platform `fetch`. |
| `image-size` | 1.0.0 | 2.0.2 | Can likely remove if image pipeline moves to `sharp`/Jimp metadata APIs. |
| `classnames` | 2.5.1 | 2.5.1 | Current. Optional cleanup only. |

## Vercel and Node Runtime Findings

Primary sources checked:

- Vercel supported Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Vercel package manager detection: https://vercel.com/docs/package-managers
- Node.js release status: https://nodejs.org/en/about/previous-releases
- Next.js installation requirements: https://nextjs.org/docs/app/getting-started/installation
- node-canvas installation: https://github.com/Automattic/node-canvas#installation
- sharp installation: https://sharp.pixelplumbing.com/install/
- @napi-rs/canvas README: https://github.com/Brooooooklyn/canvas
- Jimp README: https://github.com/jimp-dev/jimp

Vercel currently offers Node 24.x by default and also supports 22.x and 20.x. This repository pins `engines.node` to `14.x`, which is outside current Vercel support and outside Node.js support. Latest Next.js requires Node 20.9 or newer.

Vercel infers package manager from lockfiles. Since dropping Yarn is acceptable, npm migration is reasonable: delete `yarn.lock`, add `package-lock.json`, and let Vercel use npm. This also makes `npm audit` directly usable in CI.

## Security Findings

A temporary npm lockfile was generated in `/tmp` with `npm install --package-lock-only --ignore-scripts` to avoid running native install scripts. `npm audit --omit=dev` reported 16 production vulnerabilities: 4 low, 2 moderate, 6 high, 4 critical.

High-impact direct causes:

- `next@12.0.7`: critical/high advisories and vulnerable transitives; fix requires major Next upgrade.
- `axios@0.24.0`: multiple SSRF, credential leakage, ReDoS, and prototype-pollution advisories; easiest fix is removal.
- `canvas@2.6.1`: high severity via `node-pre-gyp -> tar`; npm suggests `canvas@2.11.2`, but that would not solve the broader native deployment risk.

## Correction to Initial Assumption

The issue is not exactly that canvas libraries depend on old Node versions. `canvas@2.6.1` declares `node >=6`, while `canvas@3.2.3` declares `^18.12.0 || >=20.9.0`. The real problem is that current `canvas@2.6.1` uses an old native addon/prebuild toolchain and requires Cairo-related native libraries. The custom `vercel-build` script with `yum install` and manual `.so` copies is a symptom of that deployment fragility.

## Recommended Migration Strategy

Do not perform one large blind dependency bump. Split the work:

1. Runtime/package-manager PR: move to npm, set Node to `24.x` or at least `22.x`, add `build`, `typecheck`, and CI-friendly audit commands.
2. Image pipeline PR: remove `axios` and replace URL fetching with `fetch` plus timeout, content-type checks, byte limits, and SSRF protections.
3. Native image PR: replace `canvas` if possible. Preferred candidate is `sharp` for metadata, resize, raw pixel access, palette/color quantization, and PNG/JPEG output. It is native but actively maintained, has prebuilt binaries for common Linux targets, and fits image processing better than a Canvas API. If keeping Canvas semantics is more important, evaluate `@napi-rs/canvas`; it advertises zero system dependencies but still uses native Node-API binaries. If avoiding native modules matters most, evaluate Jimp, accepting likely performance tradeoffs.
4. Framework PR: upgrade Next/React together. Expect config, ESLint, TypeScript, and React typing changes.
5. Hardening PR: add tests for API parameter parsing, oversized images, unsupported content types, invalid URLs, and deterministic image output snapshots.

## Proposed First Implementation Target

Start with the image pipeline, not the framework. Removing `canvas@2.6.1`, `axios@0.24.0`, and `image-size@1.0.0` attacks the Vercel deployment blocker and the most exposed server-side risks while keeping the UI stable. After that, upgrade Next/React on a cleaner base.

## Implemented in This PR

- Set `engines.node` to `24.x`, matching Vercel's current default Node.js major.
- Migrated from Yarn lockfile to npm lockfile.
- Removed `axios` and replaced the API image fetch with native `fetch`.
- Removed `image-size`; image dimensions now come from `canvas.loadImage`.
- Updated `canvas` from `2.6.1` to `3.2.3`.
- Removed the Vercel-specific `yum install`/manual `.so` copy build script.
- Replaced `@vercel/node` API types with Next.js API route types and removed `@vercel/node`.
- Added `build`, `typecheck`, and `audit` npm scripts.

Validation:

- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing `@next/next/no-img-element` warning in `src/components/organisms/Preview/index.tsx`.
- `npm run build`: passed with the same image warning and Browserslist freshness warnings.
- `node -e \"const canvas = require('canvas'); console.log(canvas.version);\"`: loaded `canvas@3.2.3`.

Remaining risk:

- `npm audit --omit=dev` still reports vulnerabilities largely rooted in `next@12.0.7` and its old build/runtime dependency tree. Fixing those requires the next major step: Next/React migration.
- URL validation now rejects non-HTTP(S), enforces content type, timeout, and a 5 MB byte cap, but it does not yet block private IP ranges or redirect-to-private SSRF paths. Add network-level SSRF hardening before considering arbitrary external URLs fully safe.

## Implemented in the Next/React Modernization PR

Verified on 2026-06-27.

Primary sources checked:

- Next.js 16 upgrade guide: https://nextjs.org/docs/app/guides/upgrading/version-16
- Next.js TypeScript configuration: https://nextjs.org/docs/pages/api-reference/config/typescript
- React 19 upgrade guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Tailwind CSS v4 upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- ESLint flat config migration guide: https://eslint.org/docs/latest/use/configure/migration-guide
- ESLint v9 migration guide: https://eslint.org/docs/latest/use/migrate-to-9.0.0
- TypeScript 5.9 release notes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
- Vercel supported Node.js versions: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- npm audit docs: https://docs.npmjs.com/cli/v11/commands/npm-audit/

Implemented:

- Upgraded Pages Router app from `next@12.0.7` / React 17 to `next@16.2.9`, `react@19.2.7`, and `react-dom@19.2.7`.
- Kept Pages Router. App Router migration is not justified for this small app and API route because the current page/API surface migrates cleanly without changing routing semantics.
- Updated `eslint-config-next` to 16.2.9 and migrated from `.eslintrc.js` to `eslint.config.mjs`.
- Used `eslint@9.39.4` instead of `eslint@10.6.0` because the plugins bundled by `eslint-config-next@16.2.9` still declare peer compatibility through ESLint 9.
- Updated React and Node types, PostCSS, Autoprefixer, Sass, Prettier, Babel, `classnames`, and Tailwind to the latest compatible v3 line.
- Deferred Tailwind v4. The official v4 guide moves the PostCSS plugin to `@tailwindcss/postcss`, removes the need for Autoprefixer, changes import style, and raises browser requirements. That should be a separate visual/CSS PR.
- Moved API helpers out of `src/pages/api/_lib` into `src/server/pixelImage` so Next only exposes `src/pages/api/index.ts` as an API route.
- Added SSRF hardening for image fetches: HTTP(S)-only URLs, DNS resolution checks for localhost/private/link-local/documentation/multicast ranges, and redirect validation with a maximum redirect count.
- Preserved fetch timeout, byte limit, and content-type validation.
- Added Vitest coverage for query parsing, URL/protocol rejection, private IP rejection, unsupported content-type, oversized image response, and valid buffer return.
- Re-resolved the lockfile so `node-abi@3.92.0` uses patched `semver@7.8.5`. No override is needed because `node-abi@3.92.0` declares `semver@^7.3.5`.

Validation:

- `npm run typecheck`: passed.
- `npm run lint`: passed with one existing `@next/next/no-img-element` warning for `src/components/organisms/Preview/index.tsx`.
- `npm run test`: passed, 2 files / 11 tests.
- `npm run build`: passed. Next 16 Turbopack now builds only `/`, `/_app`, `/404`, and `/api`.
- `npm audit --omit=dev`: still reports the known Next.js/PostCSS moderate finding.
- Manual API checks:
  - `http://localhost:3000/api?image=https://github.com/ivgtr.png`: `200 image/jpeg`
  - `http://localhost:3000/api?image=https://github.com/ivgtr.png&size=15&k=8`: `200 image/jpeg`
  - `http://localhost:3000/api?image=http://127.0.0.1:3000/favicon.ico`: rejected by SSRF guard, currently surfaced as the existing empty `500` error response.

Remaining risk:

- `next@16.2.9` declares an exact `postcss@8.4.31` dependency in its published package metadata. Next.js has fixed this on canary, but stable latest still carries the old PostCSS. Keep the natural stable dependency tree and wait for a stable Next.js release containing the fix unless CI requires audit-zero.
- `canvas@3.2.3 -> prebuild-install@7.1.3 -> node-abi@3.92.0 -> semver@7.8.5` is clean after lockfile re-resolution. `node-abi@4.x` exists, but `prebuild-install@7.1.3` currently depends on `node-abi@^3.3.0`; no direct app-level action is needed.
- The SSRF protection does pre-fetch DNS checks and redirect checks, but native `fetch` still performs its own connection resolution. A high-assurance implementation should use a controlled HTTP client/agent or egress proxy that connects only to the already-validated address.
- API errors still collapse to empty `500` responses. A follow-up should introduce typed client errors and return `400` for invalid user input while keeping server errors opaque.
- Tailwind v4, TypeScript 6, Babel 8, ESLint 10, and `@types/node` 26 remain deferred because they are separate major/runtime alignment decisions.
