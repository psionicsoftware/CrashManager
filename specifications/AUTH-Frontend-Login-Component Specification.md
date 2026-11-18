# AUTH-Frontend-Login-Component Specification

## User Story: HU-04-Frontend-Login-Screen-Adaptation

### Summary
This story covers the migration and adaptation of the legacy `portal-inicio-sesion-desktop.html` (from the 'stich' project) into a modern React component for the Crash Manager application. It establishes the application's default entry point, implementing a temporary hardcoded authentication mechanism that redirects to the Pool Tables Dashboard upon success. The architecture must use abstraction interfaces for the authentication service to ensure a seamless swap to Supabase Auth in upcoming sprints.

### Narrative
- **As a** System User (Employee / Manager / Admin)
- **I want to** access the system through a secure login screen as the default entry point
- **So that** I can authenticate myself and access the operational pool tables dashboard

---

## Technical Context & Scope
- **Domain / Module:** Authentication / Access Control
- **Layer:** Frontend (React 19, TypeScript, Tailwind CSS v4)
- **Prerequisites & Dependencies:** 
  - React Router DOM (for default route `/` and redirection to `/dashboard`)
  - Legacy UI assets and structure from `portal-inicio-sesion-desktop.html`
- **Out of Scope:** Real backend authentication, JWT token management, database connection, or Supabase SDK integration (this story is strictly limited to UI adaptation and hardcoded mock auth).

---

## Acceptance Criteria (Gherkin Syntax)

### Scenario 1: Successful login with valid hardcoded credentials
- **Given** the user is on the login screen
- **When** the user enters "admin" in the username field
- **And** the user enters "123" in the password field
- **And** the user clicks the login button
- **Then** the system grants access
- **And** redirects the user to the pool tables dashboard (`/dashboard`)

### Scenario 2: Failed login with invalid credentials
- **Given** the user is on the login screen
- **When** the user enters any username/password combination other than "admin" / "123"
- **And** the user clicks the login button
- **Then** the system denies access
- **And** displays the exact error message: "Usuario/contraseña no válidos"

### Scenario 3: Failed login with empty fields
- **Given** the user is on the login screen
- **When** the user leaves either the username or password field empty
- **And** the user clicks the login button
- **Then** the system denies access
- **And** displays the exact error message: "completar los datos"

### Scenario 4: Default entry point routing
- **Given** an unauthenticated user opens the root URL (`/`) of the application
- **When** the application loads
- **Then** the system must render the Login component by default

---

## OpenSpec / SDD Field Mappings
- **Data Model Requirements:** 
  - Local component state for `username` (string), `password` (string), and `errorMessage` (string | null).
- **UI / UX Elements:** 
  - Username input field
  - Password input field (masked)
  - Submit button
  - Error feedback label (styled in red/alert colors)
  - UI structure must mirror the original `portal-inicio-sesion-desktop.html` but strictly utilizing React functional components and Tailwind CSS v4 utility classes.
- **Security & Authorization (Mocking & Supabase Preparation):** 
  - Do NOT write auth logic directly inside the UI component's `onSubmit` handler.
  - Implement a separated service layer (e.g., `AuthService.ts`) with a `login(user, pass)` async method.
  - The `AuthService.login()` must currently resolve true for `admin`/`123` and reject otherwise. This ensures the future Supabase BaaS merge only requires rewriting the inside of `AuthService.ts` without touching the React UI component.
- **Definition of Done (DoD):**
  - [ ] Unit & integration tests pass with required coverage
  - [ ] Linting and accessibility standards met
  - [ ] React Router default routing (`/`) points to the Login component
  - [ ] Acceptance criteria verified in staging environment
  - [ ] UI is fully responsive and visually matches the legacy HTML baseline