# Design

## Context

See `proposal.md` for motivation and scope boundaries. Currently:
- `src/App.tsx` manages authentication with `const [isAuthenticated, setIsAuthenticated] = useState(true)` (`L45`) and does not use a router (`react-router-dom` is not installed in `package.json`).
- `src/components/LoginScreen.tsx` pre-populates demo credentials (`jorge@crashmanager.com` / `••••••••••••`), performs inline lookup against `OPERATORS` inside `handleSubmit`, and diverges from `stich-html-import/portal-inicio-sesion-desktop.html` (card width `440px` vs `490px`, missing left input icons, missing billiard pocket ornament in card header, and missing the bottom telemetry footer).

## Goals / Non-Goals

**Goals:**
- Introduce a clean `IAuthService` contract and `AuthService` implementation (`src/services/authService.ts`) so UI components never embed authentication validation rules.
- Configure `react-router-dom` with `/` rendering the Login view (`LoginScreen`) and `/dashboard` rendering the authenticated operational shell.
- Align `src/components/LoginScreen.tsx` and `src/index.css` tokens with `stich-html-import/portal-inicio-sesion-desktop.html`.

**Non-Goals:**
- Introducing global state libraries (Redux, Zustand) or complex auth context providers beyond what `App.tsx` and `AuthService` require.
- Implementing real network requests, token persistence, or Supabase client wiring in this change.

## Decisions

### 1. Decoupled Authentication Service (`src/services/authService.ts`)
- **Choice**: Create `src/services/authService.ts` exporting an `AuthResult` / `AuthUser` type, an `IAuthService` interface with `login(username: string, password: string): Promise<AuthUser>`, and a singleton `authService` instance.
- **Validation Behavior**:
  - If `!username.trim() || !password.trim()`, reject with `new Error('completar los datos')`.
  - If `username.trim() === 'admin' && password === '123'`, resolve with an authenticated user/operator profile.
  - Otherwise, reject with `new Error('Usuario/contraseña no válidos')`.
- **Rationale**: Keeps `LoginScreen.tsx` strictly responsible for form state (`username`, `password`, `errorMessage`, `showPassword`, `isSubmitting`) and navigation. When Supabase Auth is integrated in a subsequent sprint, only `src/services/authService.ts` changes.
- **Alternatives Considered**:
  - *Inline validation in `LoginScreen.tsx`*: Rejected because `HU-04` explicitly forbids auth logic inside the component's `onSubmit` handler.

### 2. Client-Side Routing with `react-router-dom`
- **Choice**: Install `react-router-dom` and wrap the application in `BrowserRouter` (in `src/main.tsx` or `src/App.tsx`). Define routes:
  - `/`: Renders `LoginScreen` (or redirects to `/dashboard` if already authenticated).
  - `/dashboard`: Protected route that renders the operational dashboard shell (`Sidebar`, `TopBar`, `TableBoard`, `AnalyticsView`, `HistoryCashView`, and operational modals) when `isAuthenticated === true`, or `<Navigate to="/" replace />` when `false`.
  - `*`: Catch-all `<Navigate to="/" replace />`.
- **Default Boot State**: Initialize `isAuthenticated` to `false` in `src/App.tsx` so opening `/` always starts at the Login screen per Scenario 4. Locking the shift (`TopBar`) or confirming `Cierre Z` sets `isAuthenticated(false)` and navigates back to `/`.
- **Alternatives Considered**:
  - *Conditional rendering without URL changes*: Rejected because `HU-04` requires `/` as the default entry route and explicit redirection to `/dashboard`.

### 3. Stitch HTML Visual Adaptation in `src/components/LoginScreen.tsx`
- **Choice**: Map the structure and tokens of `stich-html-import/portal-inicio-sesion-desktop.html` into `src/components/LoginScreen.tsx` using Tailwind CSS v4 utilities and `@theme` custom tokens in `src/index.css` (or direct semantic classes matching the Stitch palette: `surface: #f8f9ff`, `surface-container-lowest: #ffffff`, `surface-container-low: #eff4ff`, `surface-container-high: #dce9ff`, `surface-container-highest: #d3e4fe`, `primary: #006948`, `primary-container: #00855d`, `on-surface: #0b1c30`, `on-surface-variant: #3d4a42`, `error: #ba1a1a`, `error-container: #ffdad6`, `on-error-container: #93000a`).
- **Key Layout Elements Preserved from Stitch**:
  - Fixed blurred top header (`h-16`) with `CRASH / Manager Ops`, pulsing `Auth Gate • Secure` pill, and user avatar circle.
  - Ambient blurred radial background blobs (`bg-primary/10`, `bg-secondary-container/20`, gradient strip).
  - Central card (`max-w-[490px]`) with top slate header strip, billiard pocket indicator dot, `Acceso Operativo de Turno` heading, `Usuario u Operador` input with left badge icon, `Contraseña de Control` input with left lock icon and right visibility toggle button, red alert banner for `errorMessage`, primary submit button (`Iniciar Sesión en el Turno`), and bottom telemetry footer (`v2.4.19-prod | Crash Manager Venue Telemetry Systems`).
  - Inputs initialize empty (`""`) and use `noValidate` on `<form>` so custom validation handles empty fields and renders `"completar los datos"` instead of native browser tooltips blocking submission.

## Risks / Trade-offs

- **[Risk] Native HTML5 `required` attribute prevents custom `"completar los datos"` message from showing on submit** → **Mitigation**: Use `noValidate` on the `<form>` element in `LoginScreen.tsx` and let `handleSubmit` / `authService.login` trigger and display the exact `"completar los datos"` error banner required by Scenario 3.
- **[Risk] Installing `react-router-dom` fails with `npm install` due to existing Vite 8 / esbuild peer dependency mismatch** → **Mitigation**: Install using `npm install react-router-dom --legacy-peer-deps`.
