# Proposal

## Why

Crash Manager currently boots directly into an authenticated dashboard (`isAuthenticated = true`) using inline demo operator selection, bypassing a proper entry gate and diverging from the canonical Google Stitch login prototype (`stich-html-import/portal-inicio-sesion-desktop.html`). Adapting the Stitch login screen as the default entry route (`/`) with an abstracted authentication service establishes a clean access boundary ready for future Supabase Auth integration.

## What Changes

- **BREAKING**: Change application startup behavior so unauthenticated visits to `/` render the Login screen by default instead of opening the operational dashboard directly.
- Add client-side routing (`react-router-dom`) defining `/` for the Login view and `/dashboard` for the operational pool tables shell.
- Introduce a decoupled authentication service (`src/services/authService.ts`) exposing an async `login(username, password)` contract that validates hardcoded credentials (`admin` / `123`) and returns localized error feedback (`"completar los datos"` for empty fields, `"Usuario/contraseña no válidos"` for invalid credentials).
- Adapt `src/components/LoginScreen.tsx` to faithfully match the visual layout, Material 3 surface tokens, typography, input icons, header, and telemetry footer from `stich-html-import/portal-inicio-sesion-desktop.html` using React 19 and Tailwind CSS v4.

### Scope Boundaries

- **In Scope**:
  - Visual and structural adaptation of `stich-html-import/portal-inicio-sesion-desktop.html` into `src/components/LoginScreen.tsx`.
  - Creation of `src/services/authService.ts` with an interface-backed hardcoded `admin` / `123` authentication flow.
  - Route configuration (`/` and `/dashboard`) and redirection upon login/logout.
  - Validation states and Spanish error alerts (`"completar los datos"`, `"Usuario/contraseña no válidos"`).
- **Out of Scope**:
  - Real backend authentication, JWT token management, database connections, or Supabase SDK integration.
  - Changes to table timers, fractional billing calculations, or canteen checkout rules.

## Capabilities

### New Capabilities
- `user-auth`: Default login entry route (`/`), Stitch-aligned login screen UI, empty/invalid credential validation, abstracted authentication service contract, and redirection to `/dashboard`.

### Modified Capabilities
<!-- None -->

## Impact

- **Domain Types / Data Models (`src/types/`)**: Minimal impact; adds authentication service request/response contracts (either in `src/types/auth.ts` or `src/types/billiards.ts`) without altering pool table, player, or ticket models.
- **Billing / Time Utilities (`src/utils/`)**: No impact (`src/utils/format.ts` remains unchanged).
- **Frontend UI Views / Modals (`src/components/`)**: Updates `src/components/LoginScreen.tsx` and `src/App.tsx` to integrate React Router navigation (`/` -> `/dashboard`) and delegate credential checks to `src/services/authService.ts`.
- **Dependencies (`package.json`)**: Adds `react-router-dom` for declarative client-side routing.
