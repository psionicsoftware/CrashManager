# user-auth Specification

## Purpose

Provides the default login entry gate (`/`), Stitch-aligned operator login interface, credential validation with Spanish error messages, and authenticated navigation to the operational pool tables dashboard (`/dashboard`).

## Requirements

### Requirement: Default Login Entry Point Routing
The system SHALL render the login screen by default when an unauthenticated user navigates to the root URL (`/`) and SHALL restrict unauthenticated access to `/dashboard`.

#### Scenario: Default entry point routing on root URL
- **GIVEN** an unauthenticated user opens the root URL (`/`) of the application
- **WHEN** the application loads
- **THEN** the system renders the Login screen by default

#### Scenario: Unauthenticated access to dashboard redirects to login
- **GIVEN** an unauthenticated user navigates directly to `/dashboard`
- **WHEN** the route is evaluated
- **THEN** the system redirects the user to `/` to authenticate first

### Requirement: Valid Credential Authentication and Redirection
The system SHALL authenticate the user when valid credentials (`"admin"` and `"123"`) are submitted through the decoupled authentication service and SHALL redirect the user to `/dashboard`.

#### Scenario: Successful login with valid hardcoded credentials
- **GIVEN** the user is on the login screen (`/`)
- **WHEN** the user enters `"admin"` in the username field
- **AND** the user enters `"123"` in the password field
- **AND** the user clicks the login submit button
- **THEN** the system grants access
- **AND** redirects the user to the pool tables dashboard (`/dashboard`)

### Requirement: Invalid Credential Rejection
The system SHALL deny access and display the exact message `"Usuario/contraseña no válidos"` when non-empty credentials other than `"admin"` / `"123"` are submitted.

#### Scenario: Failed login with invalid credentials
- **GIVEN** the user is on the login screen (`/`)
- **WHEN** the user enters any non-empty username/password combination other than `"admin"` / `"123"`
- **AND** the user clicks the login submit button
- **THEN** the system denies access
- **AND** displays the exact error message `"Usuario/contraseña no válidos"` in an alert banner

### Requirement: Empty Credential Field Validation
The system SHALL deny access and display the exact message `"completar los datos"` when the login form is submitted with an empty username or empty password field.

#### Scenario: Failed login with empty fields
- **GIVEN** the user is on the login screen (`/`)
- **WHEN** the user leaves either the username or password field empty (or whitespace-only)
- **AND** the user clicks the login submit button
- **THEN** the system denies access
- **AND** displays the exact error message `"completar los datos"` in an alert banner

### Requirement: Stitch Login Screen Visual and Interactive Fidelity
The login screen SHALL match the layout, Material 3 surface tokens, header, input fields, password visibility toggle, and footer of `stich-html-import/portal-inicio-sesion-desktop.html`.

#### Scenario: Login screen visual structure and password visibility toggle
- **GIVEN** the user views the login screen (`/`)
- **WHEN** the user clicks the password visibility toggle button inside the password field
- **THEN** the password input switches between masked (`password`) and plain text (`text`) while preserving the Stitch header, `490px` card layout, and telemetry footer
