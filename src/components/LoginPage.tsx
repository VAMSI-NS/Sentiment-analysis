import React, { FormEvent, useState } from 'react';
import { BrainCircuit, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface LoginPageProps {
  backendError?: string | null;
  onAuthenticate: (
    email: string,
    password: string,
    role: UserRole,
    createAccount: boolean,
  ) => Promise<AuthUser>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ backendError, onAuthenticate }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [createAccount, setCreateAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onAuthenticate(email, password, role, createAccount);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const selectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setCreateAccount(false);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between min-h-[300px] lg:min-h-[640px]">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="font-extrabold text-xl tracking-tight">
                Feedback<span className="text-indigo-300">AI</span>
              </div>
            </div>
            <div className="mt-14 max-w-md">
              <span className="text-indigo-200 text-xs font-bold tracking-[0.18em] uppercase">
                Student Feedback Intelligence
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black leading-tight">
                Every voice can help improve the learning experience.
              </h1>
              <p className="mt-4 text-sm leading-6 text-indigo-100/85">
                Sign in to submit feedback and explore sentiment insights securely.
              </p>
            </div>
          </div>
          <div className="relative grid sm:grid-cols-2 gap-3 mt-10">
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <UserRound className="w-5 h-5 text-indigo-200" />
              <div className="mt-3 font-semibold text-sm">Student workspace</div>
              <p className="mt-1 text-xs text-indigo-100/75">Share feedback and revisit your submissions.</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <ShieldCheck className="w-5 h-5 text-indigo-200" />
              <div className="mt-3 font-semibold text-sm">Dean insights</div>
              <p className="mt-1 text-xs text-indigo-100/75">Review feedback and database-backed trends.</p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-7">
              <div className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase mb-2">
                Secure access
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {createAccount ? 'Create your student account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {createAccount ? 'Register with your email to get started.' : 'Choose your workspace and sign in.'}
              </p>
            </div>

            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6" role="tablist" aria-label="Account role">
              {(['student', 'dean'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={role === value}
                  onClick={() => selectRole(value)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    role === value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {value === 'student' ? 'Student' : 'Dean'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={320}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="you@university.edu"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete={createAccount ? 'new-password' : 'current-password'}
                    required
                    minLength={createAccount ? 10 : 1}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder={createAccount ? 'At least 10 characters' : 'Enter your password'}
                  />
                </div>
              </div>

              {(error || backendError) && (
                <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-800">
                  {error || backendError}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm py-3 transition-colors"
              >
                {busy ? 'Please wait…' : createAccount ? 'Create student account' : `Sign in as ${role}`}
              </button>
            </form>

            {role === 'student' && (
              <p className="mt-5 text-center text-sm text-slate-500">
                {createAccount ? 'Already registered?' : 'New student?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setCreateAccount(!createAccount);
                    setError('');
                  }}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {createAccount ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            )}
            <p className="mt-7 text-center text-[11px] text-slate-400">
              Your password is protected and never stored in this browser.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
