import React from 'react';
import { Play, Clock, Calendar, Eye, Filter, PlusCircle, Radio } from 'lucide-react';
import { Stream } from '../types';

interface StreamsGridProps {
  streams: Stream[];
  selectedLeague: string;
  onSelectLeague: (league: string) => void;
  onSelectStream: (id: string) => void;
  viewerMap: Record<string, number>;
  isAdmin?: boolean;
  onOpenCreateStream?: () => void;
}

export const StreamsGrid: React.FC<StreamsGridProps> = ({
  streams,
  selectedLeague,
  onSelectLeague,
  onSelectStream,
  viewerMap,
  isAdmin,
  onOpenCreateStream,
}) => {
  const leagues = [
    'Tous',
    'Ligue 1',
    'Champions League',
    'Premier League',
    'Serie A',
    'Europa League',
  ];

  const filteredStreams =
    selectedLeague === 'Tous'
      ? streams
      : streams.filter((s) => s.league.toLowerCase() === selectedLeague.toLowerCase());

  return (
    <section className="space-y-6">
      {/* Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Diffusions Programmées & En Direct</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sélectionnez un match pour accéder au lecteur haute définition et au chat
          </p>
        </div>

        {/* League interactive filter segmented buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111A15] border border-white/[0.08] overflow-x-auto max-w-full">
          <Filter className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1 shrink-0" />
          {leagues.map((league) => (
            <button
              key={league}
              onClick={() => onSelectLeague(league)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLeague === league
                  ? 'bg-[#00FF87] text-[#080C0A] shadow-md shadow-[#00FF87]/20 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Matches or Clean Empty State */}
      {filteredStreams.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#0D1410] border border-white/[0.08] max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center text-[#00FF87] mx-auto">
            <Radio className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {streams.length === 0
                ? 'Aucune diffusion programmée pour le moment'
                : `Aucun match trouvé pour "${selectedLeague}"`}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
              {streams.length === 0
                ? 'Les retransmissions apparaîtront ici dès que le staff aura programmé ou lancé un direct.'
                : 'Sélectionnez une autre catégorie ou revenez à "Tous" pour voir l\'ensemble du calendrier.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isAdmin && onOpenCreateStream ? (
              <button
                onClick={onOpenCreateStream}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Créer une diffusion maintenant</span>
              </button>
            ) : null}

            {selectedLeague !== 'Tous' && (
              <button
                onClick={() => onSelectLeague('Tous')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                Afficher toutes les diffusions
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStreams.map((stream) => {
            const isLive = stream.status === 'live';
            const streamViewers = viewerMap[stream.id] || stream.viewers;
            const kickoff = new Date(stream.kickoffTime);
            const timeFormatted = kickoff.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateFormatted = kickoff.toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={stream.id}
                onClick={() => onSelectStream(stream.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#0D1410] border border-white/[0.08] hover:border-[#00FF87]/40 hover:shadow-xl hover:shadow-[#00FF87]/10 transition-all duration-300 flex flex-col"
              >
                {/* Match Horizontal Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {stream.coverUrl ? (
                    <img
                      src={stream.coverUrl}
                      alt={stream.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#131F17] to-[#0A100C] flex items-center justify-center text-neutral-600">
                      <Radio className="w-10 h-10 text-[#00FF87]/30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1410] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/[0.1] text-[10px] font-bold uppercase tracking-wider text-white">
                      {stream.league}
                    </span>

                    {isLive ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        DIRECT
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/[0.1] text-[10px] font-semibold text-neutral-300">
                        <Clock className="w-3 h-3 text-[#00FF87]" />
                        {timeFormatted}
                      </span>
                    )}
                  </div>

                  {/* Play overlay button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-[#00FF87] text-[#080C0A] flex items-center justify-center shadow-lg shadow-[#00FF87]/40 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Live score if match is live */}
                  {isLive && stream.score && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/[0.1] text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-[#00FF87]">{stream.minute || "1'"}</span>
                      <span>{stream.score}</span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#00FF87] transition-colors line-clamp-1">
                      {stream.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {stream.homeTeam} contre {stream.awayTeam}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.05]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{dateFormatted}</span>
                      <span aria-hidden="true">·</span>
                      <span>{timeFormatted}</span>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-300 font-semibold">
                      <Eye className="w-3.5 h-3.5 text-[#00FF87]" />
                      <span className="tabular-nums">{streamViewers}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
