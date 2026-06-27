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
