# Tasks

## 1. Domain Types & Routing Dependencies

- [x] 1.1 Install `react-router-dom` using `npm install react-router-dom --legacy-peer-deps` and verify `package.json` lists `react-router-dom` and `npm run lint` passes
- [x] 1.2 Define authentication domain contracts (`IAuthService`, `AuthCredentials`, and `AuthSession` / `Operator` mapping) in `src/types/billiards.ts` (or `src/types/auth.ts`) and verify `npm run lint` (`tsc --noEmit`) succeeds with zero type errors

## 2. Authentication Service Layer

- [x] 2.1 Implement `src/services/authService.ts` with `AuthService.login(username, password)` that rejects empty/whitespace inputs with `"completar los datos"`, resolves `"admin"` / `"123"`, and rejects any other credentials with `"Usuario/contraseña no válidos"`, then verify compilation with `npm run lint`

## 3. UI Views, Stitch Adaptation & Routing Integration

- [x] 3.1 Add Stitch Material 3 surface/brand color tokens and Material Symbols font link (if needed alongside Lucide icons) in `index.html` and `src/index.css`, and verify `npm run build` compiles the stylesheet cleanly
- [x] 3.2 Refactor `src/components/LoginScreen.tsx` to mirror `stich-html-import/portal-inicio-sesion-desktop.html` (fixed top header, `490px` card with billiard pocket indicator, empty initial `username` and `password` fields, badge/lock icons, password visibility toggle, red error alert banner, and telemetry footer) while delegating submission exclusively to `authService.login()`, and verify `npm run lint` passes
- [x] 3.3 Configure `BrowserRouter`, `Routes`, and `Route` in `src/main.tsx` / `src/App.tsx` with `isAuthenticated` defaulting to `false`, `/` rendering `LoginScreen`, `/dashboard` rendering the protected pool tables dashboard shell (redirecting unauthenticated users to `/`), and shift lock / Cierre Z redirecting back to `/`, then verify `npm run lint` and `npm run build` succeed

## 4. Manual Verification in Browser

- [x] 4.1 Start the local dev server (`npm run dev` on `http://localhost:3000`) and manually verify all 4 Gherkin scenarios in the browser: (1) visiting `/` renders the Stitch-aligned Login screen by default and visiting `/dashboard` unauthenticated redirects to `/`, (2) submitting with empty username or password displays `"completar los datos"`, (3) submitting invalid credentials displays `"Usuario/contraseña no válidos"`, and (4) submitting `"admin"` / `"123"` grants access and redirects to `/dashboard`

## Workflow follow-up

- Validate the change artifacts with `openspec validate auth-frontend-login-adaptation --strict`.
- Archive the change after implementation and manual verification are complete.
