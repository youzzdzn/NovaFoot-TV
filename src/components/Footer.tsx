import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  onSelectLeague: (league: string) => void;
  onGoHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectLeague, onGoHome }) => {
  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-[#070B09] text-neutral-400 text-xs py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="https://i.postimg.cc/yNVKDkBX/novafoot.png"
            alt="NovaFoot Logo"
            referrerPolicy="no-referrer"
            className="h-8 w-auto object-contain"
          />
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight">
              NOVA<span className="text-[#00FF87]">FOOT</span>
            </span>
            <p className="text-[11px] text-neutral-500">
              Plateforme moderne de retransmission sportive & streaming football en direct.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <button
            onClick={onGoHome}
            className="hover:text-white transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => {
              onSelectLeague('Ligue 1');
              onGoHome();
            }}
            className="hover:text-white transition-colors"
          >
            Ligue 1
          </button>
          <button
            onClick={() => {
              onSelectLeague('Champions League');
              onGoHome();
            }}
            className="hover:text-white transition-colors"
          >
            Champions League
          </button>
          <a
            href="https://discord.gg/fKWtyTyNry"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5865F2] hover:text-[#7983f5] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Serveur Discord</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-neutral-500 text-[11px] text-center md:text-right">
          <p>© {new Date().getFullYear()} NovaFoot · Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
