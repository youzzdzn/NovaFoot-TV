import React, { useState } from 'react';
import { KeyRound, ShieldCheck, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Secret code specified by user: NOVA458763 (not displayed in UI)
      if (code.trim() === 'NOVA458763') {
        onSuccess();
        onClose();
        setCode('');
      } else {
        setError('Code de validation incorrect. Accès refusé.');
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D1410] border border-[#00FF87]/25 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FF87] to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center text-[#00FF87]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Espace Administrateur</h3>
            <p className="text-xs text-neutral-400">Authentification staff & gestion des diffusions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Code d'accès confidentiel
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="Entrez votre code secret"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#141F18] border border-white/[0.1] text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87] transition-all tracking-wider"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Vérification...' : 'Valider le code'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
