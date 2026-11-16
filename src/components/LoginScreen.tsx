import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { OPERATORS } from '../data/mockData';
import { Operator } from '../types/billiards';

interface LoginScreenProps {
  currentOperator: Operator;
  onLogin: (operator: Operator) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentOperator,
  onLogin,
}) => {
  const [email, setEmail] = useState('jorge@crashmanager.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotHint, setForgotHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Ingresa un operador y contraseña de control válidos.');
      return;
    }
    const matched =
      OPERATORS.find(
        (op) =>
          op.email.toLowerCase() === email.trim().toLowerCase() ||
          op.name.toLowerCase() === email.trim().toLowerCase()
      ) || currentOperator;
    onLogin(matched);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] flex flex-col relative overflow-hidden">
      {/* Soft ambient radial wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 82% 88%, rgba(16, 185, 129, 0.08), transparent 42%), radial-gradient(circle at 12% 15%, rgba(14, 165, 233, 0.06), transparent 45%)',
        }}
      />

      {/* Minimal Top Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#eff4ff] border border-emerald-200 flex items-center justify-center text-[#006948]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-[#0b1c30]">
              CRASH
            </div>
            <div className="text-[10px] font-mono font-semibold tracking-wider text-slate-500">
              MANAGER OPS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <Lock className="w-3 h-3 text-[#006948]" />
            Auth Gate · Secure
          </span>
          <div className="w-9 h-9 rounded-full bg-[#006948] text-white flex items-center justify-center shadow-sm">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(11,28,48,0.1)] overflow-hidden">
          {/* Card Header */}
          <div className="px-7 py-5 bg-[#f8fbff] border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-sm">
                <span className="font-mono font-bold text-base">CM</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0b1c30] leading-tight">
                  Crash Manager
                </h2>
                <p className="text-xs text-slate-500">
                  Control de Mesas · Gestión de Salón
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              POS
            </span>
          </div>

          {/* Card Form */}
          <form onSubmit={handleSubmit} className="p-7 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">
                Acceso Operativo de Turno
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa tus credenciales o selecciona un operador asignado.
              </p>
            </div>

            {errorMsg && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {forgotHint && (
              <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                Clave de turno demo preconfigurada. Presiona{' '}
                <span className="font-semibold">Iniciar Sesión en el Turno</span>{' '}
                para acceder.
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="operator-email"
                className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
              >
                Usuario u Operador
              </label>
              <input
                id="operator-email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#f8fafc] border border-slate-200 text-sm font-medium text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 transition-all"
                placeholder="operador@crashmanager.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="operator-password"
                  className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
                >
                  Contraseña de Control
                </label>
                <button
                  type="button"
                  onClick={() => setForgotHint((v) => !v)}
                  className="text-xs font-semibold text-[#006948] hover:underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative">
                <input
                  id="operator-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#f8fafc] border border-slate-200 text-sm font-medium text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006948] focus:ring-2 focus:ring-[#006948]/15 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#006948] hover:bg-[#00583c] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Iniciar Sesión en el Turno</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Operator Switcher */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-medium text-slate-400 mb-2">
                Cambio rápido de operador de guardia:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setEmail(op.email);
                      setPassword('••••••••••••');
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      email.toLowerCase() === op.email.toLowerCase()
                        ? 'border-[#006948] bg-emerald-50/70 text-[#006948]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center shrink-0 text-slate-700">
                      {op.initials}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {op.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
