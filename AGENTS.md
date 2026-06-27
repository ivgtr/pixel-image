# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 TypeScript app that serves both a web UI and an image-generation API.

- `src/pages/index.tsx` contains the main Pixel Image web page.
- `src/pages/api/index.ts` is the API entry point. Server-side image helpers live in `src/server/pixelImage/`.
- `src/components/` follows an atoms/molecules/organisms structure for UI components.
- `src/layouts/DefaultLayout/` contains shared page layout.
- `tests/api/` contains Vitest coverage for API parser and image-fetch validation behavior.
- `public/` stores static assets such as `favicon.ico`.

## Build, Test, and Development Commands

Use npm, since this repository uses `package-lock.json`.

- `npm run dev` starts the local Next.js development server on port 3000.
- `npm run build` creates a production Next.js build.
- `npm run start` runs a previously built Next.js app.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run test` runs the Vitest API test suite.
- `npm run lint` checks source and test files with ESLint.
- `npm run lint:web` checks JSX/TSX/CSS/SCSS files.
- `npm run lint:api` checks JS/TS API and helper files.
- `npm run format` formats source and root JS/TS/CSS/SCSS files with Prettier.
- `npm run audit` runs `npm audit --omit=dev`.
- `npm run proxy` exposes port 3000 through ngrok.

## Coding Style & Naming Conventions

Write TypeScript for application and API code. Keep `tsconfig.json` strictness intact. Use 2-space indentation, no tabs, and a 100-character print width per `.prettierrc.json`.

Components are exported from `index.tsx` files in PascalCase directories, for example `src/components/organisms/Form/index.tsx`. Prefer named exports for components and helpers. Tailwind utility classes are commonly composed with `classnames`.

## Testing Guidelines

For changes, at minimum run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`. Manually verify `npm run dev` with the web UI and `/api?image=...&size=15&k=8` when API or rendering behavior changes.

Put API-focused tests under `tests/api/`. Keep tests deterministic and avoid real network access by mocking `fetch` and DNS resolution where possible.

## Commit & Pull Request Guidelines

Recent commits use emoji-prefixed, scoped intent messages such as `:sparkles: add: ...`, `:ambulance: fix: ...`, and `:pencil: change: ...`. Follow that concise pattern and write the subject in the project’s existing language when appropriate.

Pull requests should include a short summary, affected UI/API behavior, verification steps, and screenshots or example API URLs for visual output changes. Link related issues when available.

## Security & Configuration Tips

The API fetches remote image URLs from request parameters. Treat URL parsing, image-size limits, and `canvas` processing paths as security-sensitive. Avoid committing secrets or environment-specific credentials.

Preserve fetch timeout, byte limits, content-type validation, redirect validation, and private/local address blocking when refactoring the image pipeline. `npm audit --omit=dev` may report the known Next.js stable PostCSS advisory until a stable Next.js release includes the upstream fix; do not use `npm audit fix --force` blindly.
