import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Eye, Calendar, Trophy, Shield, Share2, AlertCircle } from 'lucide-react';
import { Stream, SituationType, CustomOverlayConfig, FeaturedHeroConfig } from './types';
import { INITIAL_STREAMS } from './data/initialStreams';
import { Navbar } from './components/Navbar';
import { HeroFeatured } from './components/HeroFeatured';
import { StreamsGrid } from './components/StreamsGrid';
import { VideoPlayer } from './components/VideoPlayer';
import { LiveChat } from './components/LiveChat';
import { DiscordBanner } from './components/DiscordBanner';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CreateStreamWizard } from './components/CreateStreamWizard';
import { ManageStreamsModal } from './components/ManageStreamsModal';
import { EditFeaturedModal } from './components/EditFeaturedModal';

export default function App() {
  const [streams, setStreams] = useState<Stream[]>(() => {
    const saved = localStorage.getItem('novafoot_streams');
    if (saved) {
      try {
        const parsed: Stream[] = JSON.parse(saved);
        // Exclude previous mock streams
        const real = parsed.filter((s) => !s.id.match(/^stream-[1-6]$/));
        return real;
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>('Tous');

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('novafoot_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isCreateStreamOpen, setIsCreateStreamOpen] = useState(false);
  const [isManageStreamsOpen, setIsManageStreamsOpen] = useState(false);
  const [isEditFeaturedOpen, setIsEditFeaturedOpen] = useState(false);

  // Custom Featured Hero configuration (editable by admin)
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedHeroConfig | null>(() => {
    const saved = localStorage.getItem('novafoot_featured_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Dynamic simulated viewer counts (fluctuates around ~500 visitors naturally)
  const [totalLiveViewers, setTotalLiveViewers] = useState<number>(518);
  const [viewerMap, setViewerMap] = useState<Record<string, number>>({});

  // Sync streams and featured hero config with backend API on mount
  useEffect(() => {
    const fetchStreamsAndFeatured = async () => {
      try {
        const res = await fetch('/api/streams');
        if (res.ok) {
          const data: Stream[] = await res.json();
          const real = data.filter((s) => !s.id.match(/^stream-[1-6]$/));
          setStreams(real);
        }

        const featRes = await fetch('/api/featured');
        if (featRes.ok) {
          const featData = await featRes.json();
          if (featData && featData.title) {
            setFeaturedConfig(featData);
          }
        }
      } catch (err) {
        console.warn('API streams fetch fallback to local:', err);
      }
    };
    fetchStreamsAndFeatured();
  }, []);

  // Save streams locally whenever changed
  useEffect(() => {
    localStorage.setItem('novafoot_streams', JSON.stringify(streams));
  }, [streams]);

  // Fluctuating realistic viewer numbers
  useEffect(() => {
    const updateViewers = () => {
      const base = 515 + Math.floor(Math.random() * 30) - 15;
      setTotalLiveViewers(base);

      const newMap: Record<string, number> = {};
      streams.forEach((s) => {
        const variance = Math.floor(Math.random() * 20) - 10;
        newMap[s.id] = Math.max(50, (s.viewers || 480) + variance);
      });
      setViewerMap(newMap);
    };

    updateViewers();
    const interval = setInterval(updateViewers, 10000);
    return () => clearInterval(interval);
  }, [streams.length]);

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('novafoot_admin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('novafoot_admin');
  };

  const handleStreamCreated = async (newStream: Stream) => {
    setStreams((prev) => [newStream, ...prev]);
    setActiveStreamId(newStream.id);

    try {
      await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStream),
      });
    } catch (e) {
      console.warn('Failed to post stream to server:', e);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = streams.map((s) => ({
      ...s,
      isFeatured: s.id === id ? !s.isFeatured : false,
    }));
    setStreams(updated);

    try {
      const target = updated.find((s) => s.id === id);
      if (target) {
        await fetch(`/api/streams/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFeatured: target.isFeatured }),
        });
      }
    } catch (e) {
      console.warn('Failed to update featured stream on server:', e);
    }
  };

  const handleDeleteStream = async (id: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== id));
    if (activeStreamId === id) {
      setActiveStreamId(null);
    }

    try {
      await fetch(`/api/streams/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete stream on server:', e);
    }
  };

  const handleSaveFeaturedConfig = async (config: FeaturedHeroConfig) => {
    setFeaturedConfig(config);
    localStorage.setItem('novafoot_featured_config', JSON.stringify(config));
    try {
      await fetch('/api/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (e) {
      console.warn('Failed to save featured config to server:', e);
    }
  };

  const handleUpdateSituation = async (
    situation: SituationType,
    customOverlay?: CustomOverlayConfig
  ) => {
    if (!activeStreamId) return;

    setStreams((prev) =>
      prev.map((s) => {
        if (s.id === activeStreamId) {
          return {
            ...s,
            currentSituation: situation,
            customOverlay: customOverlay || s.customOverlay,
          };
        }
        return s;
      })
    );

    try {
      await fetch(`/api/streams/${activeStreamId}/situation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, customOverlay }),
      });
    } catch (e) {
      console.warn('Failed to update situation on server:', e);
    }
  };

  // Find active stream or featured stream
  const activeStream = streams.find((s) => s.id === activeStreamId);
  const featuredStream = streams.find((s) => s.isFeatured) || (streams.length > 0 ? streams[0] : undefined);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C0A] text-[#E6ECE8]">
      {/* Top Navigation */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenCreateStream={() => setIsCreateStreamOpen(true)}
        onOpenManageStreams={() => setIsManageStreamsOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onGoHome={() => setActiveStreamId(null)}
        selectedLeague={selectedLeague}
        onSelectLeague={setSelectedLeague}
        totalLiveViewers={totalLiveViewers}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {activeStream ? (
          /* ============================================================ */
          /* STREAM PLAYER & CHAT VIEW */
          /* ============================================================ */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar Navigation & Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
              <button
                onClick={() => setActiveStreamId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all w-fit active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-[#00FF87]" />
                <span>Retour aux matches</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#111A15] border border-white/[0.1] text-xs font-semibold text-neutral-300">
                  {activeStream.league}
                </span>

                {activeStream.status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    <span>EN DIRECT</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] text-neutral-300 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#00FF87]" />
                    <span>À VENIR</span>
                  </span>
                )}
              </div>
            </div>

            {/* 2-COLUMN VIEWPORT: VIDEO PLAYER (LEFT) & LIVE CHAT (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Player & Stream Info */}
              <div className="lg:col-span-2 space-y-4">
                <VideoPlayer
                  stream={activeStream}
                  isAdmin={isAdmin}
                  onUpdateSituation={handleUpdateSituation}
                  viewerCount={viewerMap[activeStream.id] || activeStream.viewers}
                />

                {/* Match Details Strip */}
                <div className="p-5 rounded-2xl bg-[#0D1410] border border-white/[0.08] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {activeStream.title}
                    </h1>

                    {activeStream.score && (
                      <div className="px-3 py-1 rounded-xl bg-[#141F18] border border-[#00FF87]/30 text-white font-extrabold text-base flex items-center gap-2 w-fit">
                        <span className="text-[#00FF87] text-xs">{activeStream.minute || "1'"}</span>
                        <span>{activeStream.score}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {activeStream.description ||
                      `Diffusion en direct du match ${activeStream.title}. Profitez d'une qualité haute définition optimisée sans coupures, avec écrans de situation en temps réel.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-400 border-t border-white/[0.05]">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[#00FF87]" />
                      <span>{activeStream.league}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        {new Date(activeStream.kickoffTime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1.5 text-white font-semibold">
                      <Eye className="w-3.5 h-3.5 text-[#00FF87]" />
                      <span className="tabular-nums">
                        {viewerMap[activeStream.id] || activeStream.viewers} spectateurs
                      </span>
                    </span>
                  </div>
                </div>

                {/* Other matches carousel */}
                {streams.filter((s) => s.id !== activeStream.id).length > 0 && (
                  <div className="pt-4 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                      Autres diffusions au programme
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {streams
                        .filter((s) => s.id !== activeStream.id)
                        .slice(0, 2)
                        .map((other) => (
                          <div
                            key={other.id}
                            onClick={() => setActiveStreamId(other.id)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1410] border border-white/[0.08] hover:border-[#00FF87]/40 cursor-pointer transition-all group"
                          >
                            <img
                              src={other.coverUrl || '/src/assets/images/hero_champions_league_1792512357151.jpg'}
                              alt={other.title}
                              className="w-16 h-11 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-white group-hover:text-[#00FF87] truncate block transition-colors">
                                {other.title}
                              </span>
                              <span className="text-[11px] text-neutral-400 block mt-0.5">
                                {other.league} · {other.status === 'live' ? '🔴 En direct' : '⏱️ Programmé'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Chat with 500+ viewer activity */}
              <div className="lg:col-span-1 lg:sticky lg:top-20">
                <LiveChat
                  streamId={activeStream.id}
                  isAdmin={isAdmin}
                  viewerCount={viewerMap[activeStream.id] || activeStream.viewers}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* HOMEPAGE VIEW: HERO FEATURED + STREAMS GRID + DISCORD */
          /* ============================================================ */
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Top Featured Match or Marquee */}
            <HeroFeatured
              stream={featuredStream}
              featuredConfig={featuredConfig}
              onOpenEditFeatured={() => setIsEditFeaturedOpen(true)}
              onSelectStream={(id) => setActiveStreamId(id)}
              viewerCount={viewerMap[featuredStream?.id || ''] || featuredStream?.viewers || 524}
              isAdmin={isAdmin}
              onOpenCreateStream={() => setIsCreateStreamOpen(true)}
            />

            {/* Scheduled Streams Grid with Category Filter */}
            <StreamsGrid
              streams={streams}
              selectedLeague={selectedLeague}
              onSelectLeague={setSelectedLeague}
              onSelectStream={(id) => setActiveStreamId(id)}
              viewerMap={viewerMap}
              isAdmin={isAdmin}
              onOpenCreateStream={() => setIsCreateStreamOpen(true)}
            />

            {/* Discord CTA Banner */}
            <DiscordBanner />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectLeague={(league) => {
          setSelectedLeague(league);
          setActiveStreamId(null);
        }}
        onGoHome={() => setActiveStreamId(null)}
      />

      {/* Admin Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <CreateStreamWizard
        isOpen={isCreateStreamOpen}
        onClose={() => setIsCreateStreamOpen(false)}
        onStreamCreated={handleStreamCreated}
      />

      <ManageStreamsModal
        isOpen={isManageStreamsOpen}
        onClose={() => setIsManageStreamsOpen(false)}
        streams={streams}
        onToggleFeatured={handleToggleFeatured}
        onDeleteStream={handleDeleteStream}
        onSelectStream={(id) => {
          setActiveStreamId(id);
          setIsManageStreamsOpen(false);
        }}
        onOpenCreateStream={() => setIsCreateStreamOpen(true)}
      />

      <EditFeaturedModal
        isOpen={isEditFeaturedOpen}
        onClose={() => setIsEditFeaturedOpen(false)}
        currentConfig={featuredConfig || undefined}
        onSave={handleSaveFeaturedConfig}
      />
    </div>
  );
}
