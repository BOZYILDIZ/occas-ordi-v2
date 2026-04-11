"use client";

import { useState, useEffect } from "react";

export default function MfaSetupPage() {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "done">("idle");
  const [qrUrl, setQrUrl]   = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode]     = useState("");
  const [error, setError]   = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charge l'état MFA actuel
  useEffect(() => {
    fetch("/api/admin/mfa/status")
      .then((r) => r.json())
      .then((d) => setMfaEnabled(d.mfaEnabled));
  }, []);

  // Étape 1 — génère le secret + QR code
  const startSetup = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/mfa/generate", { method: "POST" });
    const data = await res.json();
    setQrUrl(data.qrUrl);
    setSecret(data.secret);
    setStep("setup");
    setLoading(false);
  };

  // Étape 2 — vérifie le code TOTP saisi
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, secret }),
    });
    setLoading(false);
    if (res.ok) {
      setStep("done");
      setMfaEnabled(true);
    } else {
      setError("Code incorrect. Réessaie.");
    }
  };

  // Désactiver le MFA
  const disableMfa = async () => {
    if (!confirm("Désactiver le MFA ? Cela réduit la sécurité du compte.")) return;
    await fetch("/api/admin/mfa/disable", { method: "POST" });
    setMfaEnabled(false);
    setStep("idle");
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Sécurité — Double Authentification</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Protège ton compte avec Google Authenticator ou Authy (TOTP).
      </p>

      {/* Statut actuel */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8
        ${mfaEnabled
          ? "bg-green-900/20 border-green-800"
          : "bg-yellow-900/20 border-yellow-800"}`}>
        <div className={`w-3 h-3 rounded-full ${mfaEnabled ? "bg-green-400" : "bg-yellow-400"}`} />
        <div>
          <p className={`font-medium text-sm ${mfaEnabled ? "text-green-300" : "text-yellow-300"}`}>
            {mfaEnabled ? "MFA activé" : "MFA désactivé"}
          </p>
          <p className="text-gray-500 text-xs">
            {mfaEnabled
              ? "Ton compte est protégé par une double authentification."
              : "Active le MFA pour sécuriser l'accès à ce panel."}
          </p>
        </div>
      </div>

      {/* Étape idle */}
      {step === "idle" && (
        <div className="space-y-4">
          {!mfaEnabled ? (
            <button
              onClick={startSetup}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold
                         rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Activer le MFA
            </button>
          ) : (
            <button
              onClick={disableMfa}
              className="w-full py-3 bg-red-900/50 hover:bg-red-800 border border-red-800
                         text-red-300 font-semibold rounded-xl transition-colors"
            >
              Désactiver le MFA
            </button>
          )}
        </div>
      )}

      {/* Étape setup — affiche QR code */}
      {step === "setup" && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-white font-medium mb-4">
              1. Scanne ce QR code dans ton application Authenticator
            </p>
            <div className="flex justify-center bg-white p-4 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code MFA" className="w-48 h-48" />
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Ou saisis manuellement :</p>
              <p className="font-mono text-sm text-gray-200 break-all">{secret}</p>
            </div>
          </div>

          <button
            onClick={() => setStep("verify")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            J&apos;ai scanné → Valider avec un code
          </button>
        </div>
      )}

      {/* Étape verify — saisie du code */}
      {step === "verify" && (
        <form onSubmit={verifyCode} className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-white font-medium mb-4">
              2. Entre le code à 6 chiffres affiché dans ton Authenticator
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl
                         text-white text-center text-3xl tracking-[0.5em] font-mono
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                       text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "Vérification…" : "Confirmer et activer le MFA"}
          </button>
          <button
            type="button"
            onClick={() => setStep("setup")}
            className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Retour au QR code
          </button>
        </form>
      )}

      {/* Étape done */}
      {step === "done" && (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">MFA activé avec succès !</h2>
          <p className="text-gray-400 text-sm">
            À la prochaine connexion, un code à 6 chiffres te sera demandé.
          </p>
          <button
            onClick={() => setStep("idle")}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
          >
            Retour aux paramètres
          </button>
        </div>
      )}
    </div>
  );
}
