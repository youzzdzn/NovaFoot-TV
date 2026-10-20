import React, { useState, useEffect } from 'react';
import {
  Clock,
  Coffee,
  AlertTriangle,
  Radio,
  ExternalLink,
  Shield,
  Trophy,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { Stream, SituationType } from '../types';

interface SituationOverlayProps {
  stream: Stream;
  currentSituation: SituationType;
}

export const SituationOverlay: React.FC<SituationOverlayProps> = ({ stream, currentSituation }) => {
  // Real-time countdown for avant-match
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (currentSituation !== 'pre_match') return;

    const calculateTime = () => {
      const target = new Date(stream.kickoffTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [stream.kickoffTime, currentSituation]);

  if (currentSituation === 'live') {
    return null;
  }

  // Helper icon for custom overlays
  const renderCustomIcon = (iconName?: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="w-8 h-8 text-amber-400" />;
      case 'pause':
        return <Coffee className="w-8 h-8 text-emerald-400" />;
      case 'message':
        return <MessageSquare className="w-8 h-8 text-sky-400" />;
      case 'shield':
        return <Shield className="w-8 h-8 text-[#00FF87]" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-8 h-8 text-[#00FF87]" />;
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#070B09]/92 backdrop-blur-md p-6 text-center select-none overflow-hidden animate-in fade-in duration-300">
      {/* Background stadium subtle artwork */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none filter blur-sm scale-105"
        style={{
          backgroundImage: `url(${
            stream.customOverlay?.backgroundImageUrl || stream.coverUrl
          })`,
        }}
      />

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-transparent to-[#080C0A]/80 pointer-events-none" />

      {/* 1. ÉCRAN AVANT-MATCH */}
      {currentSituation === 'pre_match' && (
        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF87]/15 border border-[#00FF87]/30 text-[#00FF87] text-xs font-bold uppercase tracking-wider mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00FF87]" />
            <span>Avant-match en direct</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
            {stream.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6">
            {stream.league} · Coup d'envoi programmé
          </p>

          {/* Countdown timer */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 w-full max-w-md">
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#111A15] border border-white/[0.08]">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#00FF87] tabular-nums">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1 font-semibold">
                Jours
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#111A15] border border-white/[0.08]">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#00FF87] tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1 font-semibold">
                Heures
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#111A15] border border-white/[0.08]">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#00FF87] tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1 font-semibold">
                Minutes
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#111A15] border border-white/[0.08]">
              <span className="text-2xl sm:text-4xl font-extrabold text-white tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1 font-semibold">
                Secondes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-[#00FF87]" />
            <span>La diffusion se lancera automatiquement dès le coup d'envoi</span>
          </div>
        </div>
      )}

      {/* 2. ÉCRAN MI-TEMPS */}
      {currentSituation === 'half_time' && (
        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87] mb-4">
            <Coffee className="w-7 h-7" />
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Pause Mi-temps
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {stream.title}
          </h2>

          <div className="my-4 px-6 py-3 rounded-2xl bg-[#111A15] border border-white/[0.1] flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-neutral-400 block">{stream.homeTeam}</span>
              <span className="text-xl font-bold text-white">
                {stream.score?.split('-')[0]?.trim() || '0'}
              </span>
            </div>
            <span className="text-lg font-bold text-neutral-500">-</span>
            <div className="text-left">
              <span className="text-xs text-neutral-400 block">{stream.awayTeam}</span>
              <span className="text-xl font-bold text-white">
                {stream.score?.split('-')[1]?.trim() || '0'}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 max-w-sm mb-6 leading-relaxed">
            Les joueurs sont aux vestiaires. Reprise de la seconde période dans environ 15 minutes.
            Restez connectés !
          </p>

          <a
            href="https://discord.gg/fKWtyTyNry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-md shadow-[#5865F2]/25"
          >
            <span>Débattre de la 1ère mi-temps sur Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 3. ÉCRAN ERREUR EN ATTENTE DU STAFF */}
      {currentSituation === 'staff_error' && (
        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            Intervention Technique en Cours
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Incident sur le flux source
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
            Le staff NovaFoot est en train de réaligner la source de diffusion et de rétablir le signal
            optimal. Le direct reprendra d'un instant à l'autre sans que vous ayez besoin de rafraîchir.
          </p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111A15] border border-white/[0.08] text-xs text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Staff technique en direct sur le serveur</span>
          </div>
        </div>
      )}

      {/* 4. ÉCRAN PUB DISCORD */}
      {currentSituation === 'pub_discord' && (
        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] mb-4 shadow-lg shadow-[#5865F2]/20">
            <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>

          <span className="px-3.5 py-1 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#8591ff] text-xs font-bold uppercase tracking-wider mb-2">
            Communauté Officielle
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Rejoignez le Discord NovaFoot
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed mb-6">
            Alertes buts instantanées, liens de secours 4K, débats football en direct et pronostics avec
            plus de 2 500 passionnés de ballon rond !
          </p>

          <a
            href="https://discord.gg/fKWtyTyNry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold shadow-xl shadow-[#5865F2]/30 hover:scale-105 transition-all duration-200"
          >
            <span>Rejoindre le Discord Maintenant</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* 5. ÉCRAN PERSONNALISÉ */}
      {currentSituation === 'custom' && (
        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-lg"
            style={{
              backgroundColor: `${stream.customOverlay?.badgeColor || '#00FF87'}20`,
              borderColor: `${stream.customOverlay?.badgeColor || '#00FF87'}50`,
            }}
          >
            {renderCustomIcon(stream.customOverlay?.icon)}
          </div>

          {stream.customOverlay?.badgeText && (
            <span
              className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{
                backgroundColor: `${stream.customOverlay?.badgeColor || '#00FF87'}25`,
                color: stream.customOverlay?.badgeColor || '#00FF87',
                borderColor: `${stream.customOverlay?.badgeColor || '#00FF87'}50`,
              }}
            >
              {stream.customOverlay.badgeText}
            </span>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {stream.customOverlay?.title || 'Écran Personnalisé'}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed mb-6">
            {stream.customOverlay?.subtitle ||
              'Cet écran a été configuré par l\'administrateur de la diffusion.'}
          </p>

          {stream.customOverlay?.buttonText && stream.customOverlay?.buttonUrl && (
            <a
              href={stream.customOverlay.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#080C0A] transition-all shadow-lg hover:scale-105"
              style={{
                backgroundColor: stream.customOverlay.badgeColor || '#00FF87',
              }}
            >
              <span>{stream.customOverlay.buttonText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
