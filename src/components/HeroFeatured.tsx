import React from 'react';
import { Play, Radio, Eye, Calendar, Trophy, ChevronRight, PlusCircle, Tv, Settings } from 'lucide-react';
import { Stream, FeaturedHeroConfig } from '../types';

interface HeroFeaturedProps {
  stream?: Stream;
  featuredConfig?: FeaturedHeroConfig | null;
  onOpenEditFeatured?: () => void;
  onSelectStream: (id: string) => void;
  viewerCount: number;
  isAdmin?: boolean;
  onOpenCreateStream?: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  stream,
  featuredConfig,
  onOpenEditFeatured,
  onSelectStream,
  viewerCount,
  isAdmin,
  onOpenCreateStream,
}) => {
  // If admin customized the featured screen, use custom fields, otherwise stream fields
  const title = featuredConfig?.title || stream?.title || 'Bienvenue sur NovaFoot';
  const subtitle =
    featuredConfig?.subtitle ||
    stream?.description ||
    'Streaming football en haute définition, chat en direct interactif et diffusions programmées des grands championnats.';
  const badgeText =
    featuredConfig?.badgeText || (stream ? `À la Une · ${stream.league}` : 'Plateforme Officielle');
  const coverUrl = featuredConfig?.coverUrl || stream?.coverUrl || '';
  const buttonText =
    featuredConfig?.buttonText || (stream?.status === 'live' ? 'Regarder le direct maintenant' : 'Accéder au direct');

  const isLive = stream?.status === 'live';
  const kickoffDate = stream ? new Date(stream.kickoffTime) : null;
  const formattedTime = kickoffDate
    ? kickoffDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-black shadow-2xl group transition-all">
      {/* Background Cover Image with cinematic contrast scrim */}
      <div className="absolute inset-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#121E16] via-[#0B130E] to-[#070B08]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C0A] via-[#080C0A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C0A] via-[#080C0A]/40 to-transparent" />
      </div>

      {/* Admin Floating Edit Button */}
      {isAdmin && onOpenEditFeatured && (
        <button
          onClick={onOpenEditFeatured}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111A15]/90 hover:bg-[#00FF87] border border-[#00FF87]/40 text-[#00FF87] hover:text-[#080C0A] text-xs font-bold transition-all shadow-lg active:scale-95"
          title="Personnaliser le texte et l'image à la une"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Personnaliser la Une</span>
        </button>
      )}

      {/* Content overlay */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col justify-end min-h-[360px] sm:min-h-[420px]">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-[#00FF87]/20 border border-[#00FF87]/40 text-[#00FF87] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </span>

          {isLive ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
              <Radio className="w-3.5 h-3.5" />
              <span>EN DIRECT</span>
            </div>
          ) : formattedTime ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.1] backdrop-blur-md text-white text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#00FF87]" />
              <span>Coup d'envoi à {formattedTime}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/[0.1] text-xs font-semibold text-neutral-300">
            <Eye className="w-3.5 h-3.5 text-[#00FF87]" />
            <span className="tabular-nums text-white font-bold">{viewerCount}</span>
            <span>spectateurs</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl leading-tight mb-3">
          {title}
        </h1>

        {/* Description / Teams */}
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed mb-6">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {stream ? (
            <button
              onClick={() => onSelectStream(stream.id)}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-sm font-extrabold shadow-xl shadow-[#00FF87]/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{buttonText}</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : isAdmin && onOpenCreateStream ? (
            <button
              onClick={onOpenCreateStream}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-sm font-extrabold shadow-xl shadow-[#00FF87]/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer une diffusion</span>
            </button>
          ) : (
            <a
              href="https://discord.gg/fKWtyTyNry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-extrabold shadow-xl shadow-[#5865F2]/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Rejoindre le Discord</span>
            </a>
          )}

          {stream?.score && (
            <div className="px-5 py-3 rounded-2xl bg-[#111A15]/90 backdrop-blur-md border border-white/[0.1] text-white flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-semibold">{stream.minute || "1'"}</span>
              <span className="text-base font-extrabold text-[#00FF87]">{stream.score}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
