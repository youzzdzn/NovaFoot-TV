import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Eye,
  Settings,
  Tv,
  Coffee,
  AlertTriangle,
  Clock,
  Sparkles,
  Share2,
  RotateCcw,
  Monitor,
} from 'lucide-react';
import { Stream, SituationType, CustomOverlayConfig } from '../types';
import { SituationOverlay } from './SituationOverlay';
import { CustomOverlayModal } from './CustomOverlayModal';

interface VideoPlayerProps {
  stream: Stream;
  isAdmin: boolean;
  onUpdateSituation: (situation: SituationType, customOverlay?: CustomOverlayConfig) => void;
  viewerCount: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  isAdmin,
  onUpdateSituation,
  viewerCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Screen share stream
  const [screenMediaStream, setScreenMediaStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Custom situation overlay modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Fallback demo football video clips (high quality stable public domain video)
  const fallbackVideoUrl =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3500);
  };

  // Admin Screen Sharing trigger
  const startScreenShare = async () => {
    try {
      const media = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      } as any);
      setScreenMediaStream(media);
      setIsScreenSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play();
      }

      media.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setScreenMediaStream(null);
      };
    } catch (err) {
      console.warn('Screen share canceled or failed:', err);
    }
  };

  const crop = stream.crop || {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zoom: 1.0,
  };

  const situations: { id: SituationType; label: string; icon: React.ReactNode }[] = [
    { id: 'live', label: 'En direct', icon: <Radio className="w-3.5 h-3.5 text-[#00FF87]" /> },
    { id: 'pre_match', label: 'Avant-match', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'half_time', label: 'Mi-temps', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'staff_error', label: 'Erreur Staff', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    {
      id: 'pub_discord',
      label: 'Pub Discord',
      icon: <Radio className="w-3.5 h-3.5 text-[#5865F2]" />,
    },
    { id: 'custom', label: 'Personnalisé', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* ADMIN SITUATION BAR (Visible only to Admin above player) */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#101813] border border-[#00FF87]/30 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#00FF87] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Settings className="w-3.5 h-3.5" />
              Écrans de situation :
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {situations.map((sit) => (
                <button
                  key={sit.id}
                  onClick={() => {
                    if (sit.id === 'custom' && !stream.customOverlay) {
                      setIsCustomModalOpen(true);
                    } else {
                      onUpdateSituation(sit.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    stream.currentSituation === sit.id
                      ? 'bg-[#00FF87] text-[#080C0A] shadow-sm'
                      : 'bg-white/[0.05] text-neutral-300 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  {sit.icon}
                  <span>{sit.label}</span>
                </button>
              ))}

              {/* Edit custom button */}
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-2 py-1 rounded-lg bg-white/[0.05] text-neutral-400 hover:text-white border border-white/[0.1] text-[11px]"
                title="Configurer l'écran personnalisé"
              >
                ⚙️ Config
              </button>
            </div>
          </div>

          {/* Screen Share button for Admin */}
          <button
            onClick={startScreenShare}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isScreenSharing
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/[0.07] text-[#00FF87] hover:bg-white/[0.12] border border-[#00FF87]/30'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isScreenSharing ? 'Partage actif (Couper)' : "Partager mon écran"}</span>
          </button>
        </div>
      )}

      {/* VIDEO PLAYER CONTAINER */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setControlsVisible(false)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl flex items-center justify-center select-none group"
      >
        {/* 1. Situation Overlay (takes over when situation !== 'live') */}
        <SituationOverlay stream={stream} currentSituation={stream.currentSituation} />

        {/* 2. RECADRAGE ISOLÉ DU FLUX (Strict crop boundary: no overflow, no leak on fullscreen) */}
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
          {isScreenSharing && screenMediaStream ? (
            /* Live Admin Screen Share Stream */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-contain"
            />
          ) : stream.sourceType === 'web_crop' && stream.sourceUrl ? (
            /* External Web Stream with isolated crop math */
            <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
              <iframe
                src={
                  stream.sourceUrl.startsWith('http')
                    ? `/api/proxy?url=${encodeURIComponent(stream.sourceUrl)}`
                    : stream.sourceUrl
                }
                title="NovaFoot HD Stream"
                style={{
                  position: 'absolute',
                  width: `${(100 / crop.width) * 100 * crop.zoom}%`,
                  height: `${(100 / crop.height) * 100 * crop.zoom}%`,
                  left: `-${(crop.x / crop.width) * 100 * crop.zoom}%`,
                  top: `-${(crop.y / crop.height) * 100 * crop.zoom}%`,
                  pointerEvents: 'none',
                }}
                sandbox="allow-scripts allow-forms allow-presentation"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                className="border-0 select-none"
              />
            </div>
          ) : (
            /* Direct Video Clip */
            <video
              ref={videoRef}
              src={stream.sourceUrl || fallbackVideoUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Watermark / Logo in player top left */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none opacity-90 transition-opacity">
          <img
            src="https://i.postimg.cc/yNVKDkBX/novafoot.png"
            alt="NovaFoot Logo"
            referrerPolicy="no-referrer"
            className="h-7 w-auto drop-shadow-md"
          />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/[0.1] text-[10px] font-bold text-white uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
            <span>HD 1080p</span>
          </div>
        </div>

        {/* Top right live score & viewers */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
          {stream.score && (
            <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-bold text-white flex items-center gap-2 shadow-lg">
              <span className="text-[#00FF87]">{stream.minute || "1'"}</span>
              <span>{stream.score}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-[#00FF87]/30 text-xs font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
            <Eye className="w-3.5 h-3.5 text-[#00FF87]" />
            <span className="tabular-nums">{viewerCount}</span>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause & Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#00FF87] text-white hover:text-[#080C0A] flex items-center justify-center transition-all active:scale-95"
                title={isPlaying ? 'Mettre en pause' : 'Lecture'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 text-neutral-300 hover:text-white transition-colors"
                  title={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-[#00FF87] h-1.5 cursor-pointer bg-white/20 rounded-lg"
                />
              </div>

              {/* Direct badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>DIRECT</span>
              </div>
            </div>

            {/* Right controls: Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Overlay Config Modal */}
      <CustomOverlayModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialConfig={stream.customOverlay}
        onSave={(config) => {
          onUpdateSituation('custom', config);
        }}
      />
    </div>
  );
};
