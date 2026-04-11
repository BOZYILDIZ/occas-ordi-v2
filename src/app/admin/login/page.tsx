"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [form, setForm] = useState({ email: "", password: "", totp: "" });
  const [needsMfa, setNeedsMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email:    form.email,
      password: form.password,
      totp:     form.totp,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Si l'erreur suggère que le code MFA est requis
      if (result.error === "MFA_REQUIRED") {
        setNeedsMfa(true);
        return;
      }
      setError("Email, mot de passe ou code MFA incorrect.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Occas Ordi</h1>
          <p className="text-gray-400 text-sm mt-1">Panel Administration</p>
        </div>

        {/* Carte formulaire */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition"
                placeholder="admin@occas-ordi.fr"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white
                           placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {/* Code MFA (affiché si nécessaire) */}
            {needsMfa && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Code Google Authenticator
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={form.totp}
                  onChange={(e) => setForm({ ...form, totp: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-blue-500 rounded-lg text-white
                             text-center text-2xl tracking-widest font-mono
                             focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="000000"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Ouvre ton application Authenticator et saisis le code à 6 chiffres.
                </p>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800
                         text-white font-semibold rounded-lg transition-colors duration-200
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion…
                </>
              ) : needsMfa ? "Valider le code MFA" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <LoginForm />
    </Suspense>
  );
}
