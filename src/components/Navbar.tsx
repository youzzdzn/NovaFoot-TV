import React, { useState } from 'react';
import { Shield, PlusCircle, Settings, LogOut, KeyRound, Menu, X, Users, Tv } from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenCreateStream: () => void;
  onOpenManageStreams: () => void;
  onLogoutAdmin: () => void;
  onGoHome: () => void;
  selectedLeague: string;
  onSelectLeague: (league: string) => void;
  totalLiveViewers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onOpenCreateStream,
  onOpenManageStreams,
  onLogoutAdmin,
  onGoHome,
  selectedLeague,
  onSelectLeague,
  totalLiveViewers,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const leagues = ['Tous', 'Ligue 1', 'Champions League', 'Premier League', 'Serie A', 'Europa League'];

  return (
    <header className="sticky top-0 z-50 bg-[#080C0A]/90 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
            title="NovaFoot Accueil"
          >
            <img
              src="https://i.postimg.cc/yNVKDkBX/novafoot.png"
              alt="NovaFoot Logo"
              referrerPolicy="no-referrer"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                NOVA<span className="text-[#00FF87]">FOOT</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-semibold block -mt-1">
                Direct Football HD
              </span>
            </div>
          </button>

          {/* Desktop League Quick Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {leagues.slice(0, 4).map((league) => (
              <button
                key={league}
                onClick={() => {
                  onSelectLeague(league);
                  onGoHome();
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedLeague === league
                    ? 'bg-[#00FF87]/15 text-[#00FF87] border border-[#00FF87]/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {league}
              </button>
            ))}
          </nav>
        </div>

        {/* Global Live Viewer Pill & Discord & Admin Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Simulated 500+ active visitors indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111A15] border border-[#00FF87]/20 text-xs font-medium text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF87]"></span>
            </span>
            <Users className="w-3.5 h-3.5 text-[#00FF87]" />
            <span className="tabular-nums font-semibold text-white">{totalLiveViewers}</span>
            <span className="text-neutral-400 text-[11px]">en ligne</span>
          </div>

          {/* Discord Button in Blue as requested */}
          <a
            href="https://discord.gg/fKWtyTyNry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold shadow-md shadow-[#5865F2]/25 hover:shadow-[#5865F2]/40 transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Rejoindre le Discord</span>
          </a>

          {/* Admin Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCreateStream}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20 active:scale-95 whitespace-nowrap"
                title="Créer une nouvelle diffusion"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Créer une diffusion</span>
                <span className="sm:hidden">Créer</span>
              </button>

              <button
                onClick={onOpenManageStreams}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#141F18] border border-[#00FF87]/30 hover:border-[#00FF87] text-[#00FF87] text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap"
                title="Gérer les diffusions"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Gérer les diffusions</span>
              </button>

              <button
                onClick={onLogoutAdmin}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Déconnexion Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-neutral-300 hover:text-white transition-all whitespace-nowrap"
              title="Connexion staff / admin"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#00FF87]" />
              <span>J'ai un code</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-neutral-400 hover:text-white"
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-2">
          <div className="flex items-center justify-between py-1 text-xs text-neutral-400">
            <span>Visiteurs en direct</span>
            <span className="text-[#00FF87] font-bold">{totalLiveViewers}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 py-2">
            {leagues.map((league) => (
              <button
                key={league}
                onClick={() => {
                  onSelectLeague(league);
                  onGoHome();
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 text-xs rounded-lg ${
                  selectedLeague === league
                    ? 'bg-[#00FF87] text-[#080C0A] font-bold'
                    : 'bg-white/[0.05] text-neutral-300'
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
