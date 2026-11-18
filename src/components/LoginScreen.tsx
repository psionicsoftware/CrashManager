import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { Operator } from '../types/billiards';

interface LoginScreenProps {
  onLogin: (operator: Operator) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotHint, setForgotHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const session = await authService.login(username, password);
      onLogin(session.operator);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Usuario/contraseña no válidos';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface antialiased flex flex-col justify-between relative">
      {/* Fixed Minimal Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                sports_bar
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-semibold tracking-tight text-on-surface leading-none">
                CRASH
              </span>
              <span className="font-mono text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mt-0.5">
                Manager Ops
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider text-on-surface-variant">
                Auth Gate • Secure
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 bg-surface flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full min-h-[calc(100vh-4rem-3.5rem)] flex items-center justify-center px-4 sm:px-8 py-10 overflow-hidden">
          {/* Background Architectural Ambience */}
          <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
            <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-secondary-container/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-primary-fixed/20 via-surface-container-high/40 to-secondary-fixed/20 blur-2xl" />
          </div>

          {/* Central Floor Staff Login Module */}
          <div className="relative z-10 w-full max-w-[490px] flex flex-col items-center">
            {/* Core Administrative Card */}
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl p-4 sm:p-6 flex flex-col">
              {/* Table Slate Pocket Accents */}
              <div className="flex items-center justify-between pb-4 mb-4 bg-surface-container-low/60 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 rounded-t-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-md shadow-primary/20">
                    <span className="material-symbols-outlined text-[24px]">
                      sports_bar
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[20px] font-bold text-on-surface leading-none tracking-tight">
                      Crash Manager
                    </span>
                    <span className="text-[12px] text-on-surface-variant mt-1">
                      Control de Mesas • Gestión de Salón
                    </span>
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>

              {/* Section Title */}
              <div className="flex flex-col mb-4">
                <h1 className="text-[24px] leading-8 text-on-surface font-bold tracking-tight">
                  Acceso Operativo de Turno
                </h1>
              </div>

              {/* Authentication Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* Field 1: Operator / Username */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="operator-id"
                    className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold"
                  >
                    Usuario u Operador
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-outline flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">
                        badge
                      </span>
                    </span>
                    <input
                      id="operator-id"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 shadow-sm transition-all focus:outline-none focus:bg-surface-container-low focus:border-primary"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="operator-password"
                      className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold"
                    >
                      Contraseña de Control
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotHint((prev) => !prev)}
                      className="text-[12px] text-primary hover:text-primary-container font-semibold transition-colors"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-outline flex items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-[20px]">
                        lock
                      </span>
                    </span>
                    <input
                      id="operator-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-[14px] placeholder:text-on-surface-variant/40 shadow-sm transition-all focus:outline-none focus:bg-surface-container-low focus:border-primary"
                    />
                    <button
                      type="button"
                      aria-label="Alternar visibilidad de contraseña"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 text-outline hover:text-on-surface flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {forgotHint && (
                  <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-primary/20 text-[12px] text-on-surface-variant">
                    Entorno operativo local: ingresa usuario{' '}
                    <span className="font-mono font-semibold text-primary">
                      admin
                    </span>{' '}
                    y clave{' '}
                    <span className="font-mono font-semibold text-primary">
                      123
                    </span>
                    .
                  </div>
                )}

                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-error-container border border-error/25 text-on-error-container text-[13px] font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-error" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative w-full mt-1 group overflow-hidden rounded-lg bg-primary hover:bg-primary-container active:scale-[0.99] disabled:opacity-60 text-on-primary text-[16px] font-bold py-3 px-4 shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {isSubmitting
                      ? 'Validando...'
                      : 'Iniciar Sesión en el Turno'}
                  </span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Shift Divider */}
              <div className="relative flex items-center justify-center mt-5">
                <div className="w-full h-px bg-surface-container-high" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Telemetry Footer */}
      <footer className="w-full bg-surface-container-lowest/60 backdrop-blur-sm py-4 border-t border-surface-container-high/50">
        <div className="w-full px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-medium text-on-surface-variant">
              v2.4.19-prod
            </span>
            <span className="text-outline-variant font-mono text-[12px]">
              |
            </span>
            <span className="text-[12px] text-on-surface-variant">
              Crash Manager Venue Telemetry Systems
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#system-status"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Node Status
            </a>
            <a
              href="#terminal-help"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Support Desk
            </a>
            <a
              href="#legal-compliance"
              onClick={(e) => e.preventDefault()}
              className="text-[12px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Security Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
