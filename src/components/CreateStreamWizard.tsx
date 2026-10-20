import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock,
  Globe,
  Upload,
  Crop as CropIcon,
  Maximize2,
  Tv,
  RefreshCw,
  ExternalLink,
  Info,
  Image as ImageIcon,
  AlertCircle,
  Play,
  Trash2,
  Sparkles,
  Link2,
  Monitor,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Stream, StreamCrop } from '../types';

interface CreateStreamWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamCreated: (stream: Stream) => void;
}

const LEAGUES = [
  'Ligue 1',
  'Champions League',
  'Europa League',
  'Premier League',
  'Serie A',
  'La Liga',
  'Coupe de France',
  'Autre',
];

export const CreateStreamWizard: React.FC<CreateStreamWizardProps> = ({
  isOpen,
  onClose,
  onStreamCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Part 1 States
  const [title, setTitle] = useState('');
  const [league, setLeague] = useState('Ligue 1');
  const [kickoffTime, setKickoffTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  });
  const [coverUrl, setCoverUrl] = useState('');
  const [coverError, setCoverError] = useState(false);
  const [sourceType, setSourceType] = useState<'screen_share' | 'web_crop'>('screen_share');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');

  // Part 2 States - STRICTEMENT AUCUN LIEN PRÉDÉFINI
  const [sourceUrl, setSourceUrl] = useState('');
  const [activeIframeUrl, setActiveIframeUrl] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Part 2 Direct Screen/Tab Capture (100% stable, zero crash, zero link issues)
  const [capturedMediaStream, setCapturedMediaStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoCropSourceRef = useRef<HTMLVideoElement>(null);
  const videoCropTargetRef = useRef<HTMLVideoElement>(null);

  // Part 3 States (Crop) - Grand, Moins zoomé (1.0x) et Ultra simple
  const [crop, setCrop] = useState<StreamCrop>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zoom: 1.0,
  });

  // Attach media stream to video preview elements when available
  useEffect(() => {
    if (capturedMediaStream) {
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = capturedMediaStream;
      }
      if (videoCropSourceRef.current) {
        videoCropSourceRef.current.srcObject = capturedMediaStream;
      }
      if (videoCropTargetRef.current) {
        videoCropTargetRef.current.srcObject = capturedMediaStream;
      }
    }
  }, [capturedMediaStream, step]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverError(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!homeTeam && title.includes(' vs ')) {
      const parts = title.split(' vs ');
      setHomeTeam(parts[0].trim());
      setAwayTeam(parts[1]?.split(' - ')[0]?.trim() || 'Adversaire');
    } else if (!homeTeam) {
      setHomeTeam('Équipe A');
      setAwayTeam('Équipe B');
    }

    setStep(2);
  };

  // Launch browser tab capture (WebRTC getDisplayMedia)
  const handleStartTabCapture = async () => {
    try {
      const media = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      } as any);

      setCapturedMediaStream(media);
      setIsCapturing(true);
      setSourceType('screen_share');

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = media;
        videoPreviewRef.current.play();
      }

      media.getVideoTracks()[0].onended = () => {
        setIsCapturing(false);
        setCapturedMediaStream(null);
      };
    } catch (err) {
      console.warn('Capture annulée ou non autorisée:', err);
    }
  };

  // Load custom URL manually when entered
  const handleLoadCustomUrl = () => {
    if (!sourceUrl.trim()) return;
    let url = sourceUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setActiveIframeUrl(url);
    setSourceType('web_crop');
    setIframeKey((prev) => prev + 1);
  };

  const handleLockAndProceed = () => {
    setIsLocked(true);
    setStep(3);
  };

  const handleSaveStream = () => {
    const streamKickoff = new Date(kickoffTime);
    const isNowOrPast = streamKickoff.getTime() <= Date.now() + 5 * 60 * 1000;

    const newStream: Stream = {
      id: `stream-${Date.now()}`,
      title,
      league,
      kickoffTime: new Date(kickoffTime).toISOString(),
      coverUrl: coverUrl || '',
      isFeatured: false,
      status: isNowOrPast ? 'live' : 'upcoming',
      sourceType: capturedMediaStream ? 'screen_share' : sourceType,
      sourceUrl: activeIframeUrl || undefined,
      crop,
      currentSituation: isNowOrPast ? 'live' : 'pre_match',
      viewers: Math.floor(Math.random() * 40) + 480, // ~500 visitors
      homeTeam: homeTeam || 'Équipe 1',
      awayTeam: awayTeam || 'Équipe 2',
      score: '0 - 0',
      minute: isNowOrPast ? "1'" : 'Avant-match',
    };

    onStreamCreated(newStream);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0B100D] border border-[#00FF87]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Modal Header & Steps indicator */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#111A15]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Création d'une diffusion en direct
              </h2>
              <p className="text-xs text-neutral-400">
                {step === 1 && 'Partie 1 : Informations du match & Prévisualisation de la cover'}
                {step === 2 && 'Partie 2 : Source du flux (Partage direct ou URL sans lien prédéfini)'}
                {step === 3 && 'Partie 3 : Recadrage simplifié du lecteur vidéo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Tabs */}
        <div className="grid grid-cols-3 border-b border-white/[0.08] text-xs font-semibold bg-[#0D1410]">
          <button
            onClick={() => setStep(1)}
            className={`py-3 px-4 text-center border-b-2 flex items-center justify-center gap-2 transition-colors ${
              step === 1
                ? 'border-[#00FF87] text-[#00FF87] bg-[#00FF87]/05'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Infos & Cover</span>
          </button>

          <button
            onClick={() => title.trim() && setStep(2)}
            disabled={!title.trim()}
            className={`py-3 px-4 text-center border-b-2 flex items-center justify-center gap-2 transition-colors ${
              step === 2
                ? 'border-[#00FF87] text-[#00FF87] bg-[#00FF87]/05'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 disabled:opacity-40'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Source du Flux</span>
          </button>

          <button
            onClick={() => (capturedMediaStream || activeIframeUrl) && setStep(3)}
            disabled={!capturedMediaStream && !activeIframeUrl}
            className={`py-3 px-4 text-center border-b-2 flex items-center justify-center gap-2 transition-colors ${
              step === 3
                ? 'border-[#00FF87] text-[#00FF87] bg-[#00FF87]/05'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 disabled:opacity-40'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Recadrage Simple</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: INFOS & COVER PREVIEW */}
          {step === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nom de la diffusion / Affiche *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Real Madrid vs FC Barcelone"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Championnat *
                  </label>
                  <select
                    value={league}
                    onChange={(e) => setLeague(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
                  >
                    {LEAGUES.map((l) => (
                      <option key={l} value={l} className="bg-[#0D1410] text-white">
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Date et heure précise du coup d'envoi *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={kickoffTime}
                    onChange={(e) => setKickoffTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Détermine automatiquement le compte à rebours de l'écran avant-match.
                  </p>
                </div>
              </div>

              {/* Cover image input & LIVE PREVIEW (No preset covers) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Cover horizontale (Bannière du match)
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setCoverError(false);
                    }}
                    placeholder="Coller l'URL d'une image (ex: https://.../image.jpg)"
                    className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
                  />

                  <label className="cursor-pointer shrink-0 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#00FF87]" />
                    <span>Uploader une image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      title="Supprimer la cover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Prévisualisation de la cover placée */}
                <div className="mt-3">
                  <span className="text-xs font-semibold text-neutral-400 block mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#00FF87]" />
                    <span>Prévisualisation de la cover :</span>
                  </span>

                  {coverUrl && !coverError ? (
                    <div className="relative aspect-video max-w-md rounded-2xl overflow-hidden border-2 border-[#00FF87]/50 bg-black shadow-lg">
                      <img
                        src={coverUrl}
                        alt="Prévisualisation de la cover"
                        onError={() => setCoverError(true)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[#00FF87] text-[10px] font-bold border border-[#00FF87]/40 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Aperçu 16:9 actif</span>
                      </div>
                    </div>
                  ) : coverError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 max-w-md">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Impossible de charger cette URL d'image. Vérifiez le lien ou uploadez un fichier.</span>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-white/[0.1] bg-[#101813] text-center max-w-md text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                      <span>Aucune image sélectionnée. Collez une URL ou uploadez une image.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20 disabled:opacity-50"
                >
                  <span>Passer à la Partie 2 (Source du flux)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SOURCE DU FLUX - PARTAGE D'ONGLET OU URL PERSONNALISÉE (ZÉRO LIEN PRÉDÉFINI) */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Choice between Tab Capture (100% Reliable for FCTV) vs Custom URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSourceType('screen_share')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sourceType === 'screen_share'
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-white shadow-lg shadow-[#00FF87]/10'
                      : 'bg-[#141F18] border-white/[0.08] text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1 text-white">
                    <Radio className="w-4 h-4 text-[#00FF87]" />
                    <span>Partage direct d'onglet (Solution Recommandée)</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Diffusez directement l'onglet où tourne votre match (ex: FCTV). Aucun crash possible, aucun lien cassé, son et vidéo 1080p natifs !
                  </p>
                </div>

                <div
                  onClick={() => setSourceType('web_crop')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sourceType === 'web_crop'
                      ? 'bg-[#00FF87]/15 border-[#00FF87] text-white shadow-lg shadow-[#00FF87]/10'
                      : 'bg-[#141F18] border-white/[0.08] text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1 text-white">
                    <Globe className="w-4 h-4 text-[#00FF87]" />
                    <span>Intégrer une URL personnalisée</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Saisissez manuellement l'URL directe d'un lecteur vidéo ou d'une page pour tenter le recadrage iframe.
                  </p>
                </div>
              </div>

              {/* A. SCREEN / TAB CAPTURE SECTION */}
              {sourceType === 'screen_share' && (
                <div className="p-5 rounded-2xl bg-[#121B15] border border-[#00FF87]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00FF87]" />
                        <span>Capture directe de l'onglet du match</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        1. Ouvrez votre site de match dans un autre onglet · 2. Cliquez sur le bouton ci-dessous pour le diffuser
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartTabCapture}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                        capturedMediaStream
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] shadow-[#00FF87]/25'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>{capturedMediaStream ? 'Changer d\'onglet' : 'Sélectionner l\'onglet à diffuser'}</span>
                    </button>
                  </div>

                  {/* Live Tab Capture Preview */}
                  {capturedMediaStream ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#00FF87] bg-black shadow-2xl">
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[#00FF87] border border-[#00FF87]/40 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00FF87]" />
                        <span>Flux capturé en direct · Prêt pour le recadrage</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 rounded-2xl border-2 border-dashed border-white/[0.1] bg-black/40 text-center space-y-2">
                      <Tv className="w-10 h-10 text-[#00FF87]/40 mx-auto" />
                      <p className="text-xs text-neutral-300 font-semibold">
                        Aucun onglet sélectionné pour le moment.
                      </p>
                      <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                        Cliquez sur "Sélectionner l'onglet à diffuser" puis choisissez l'onglet de votre navigateur où tourne le lecteur vidéo (avec audio coché).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* B. CUSTOM URL SECTION (NO PREDEFINED URL) */}
              {sourceType === 'web_crop' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      URL de la page ou du lecteur vidéo à intégrer
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleLoadCustomUrl();
                            }
                          }}
                          placeholder="Collez ici l'URL exacte que vous voulez diffuser (ex: https://...)"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#00FF87]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleLoadCustomUrl}
                        disabled={!sourceUrl.trim()}
                        className="px-5 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all disabled:opacity-40 shadow-md shadow-[#00FF87]/20 whitespace-nowrap"
                      >
                        Charger cette URL
                      </button>
                    </div>
                  </div>

                  {/* Render iframe only if user entered an URL */}
                  {activeIframeUrl ? (
                    <div className="border border-white/[0.1] rounded-2xl overflow-hidden bg-black relative shadow-inner">
                      <div className="bg-[#141E18] px-4 py-2 border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                          <span className="ml-2 font-mono text-[11px] text-neutral-300 truncate max-w-md">
                            {activeIframeUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIframeKey((k) => k + 1)}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Recharger"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={activeIframeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Ouvrir dans un onglet externe"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="relative w-full h-[440px] bg-black">
                        <iframe
                          key={iframeKey}
                          src={
                            activeIframeUrl.startsWith('http')
                              ? `/api/proxy?url=${encodeURIComponent(activeIframeUrl)}`
                              : activeIframeUrl
                          }
                          title="External Stream"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-white/[0.1] bg-[#101813] text-center text-xs text-neutral-400 space-y-1">
                      <Globe className="w-8 h-8 text-neutral-600 mx-auto mb-1" />
                      <span>Aucune URL chargée. Collez votre lien et cliquez sur "Charger cette URL".</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour aux infos</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockAndProceed}
                  disabled={!capturedMediaStream && !activeIframeUrl}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20 disabled:opacity-40"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verrouiller & Passer au recadrage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RECADRAGE GRAND, MOINS ZOOMÉ ET ULTRA SIMPLE */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Top guidance */}
              <div className="p-3.5 rounded-xl bg-[#111A15] border border-white/[0.08] text-xs text-neutral-300 flex items-start gap-3">
                <CropIcon className="w-4 h-4 text-[#00FF87] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-sm">
                    Ajustez simplement la zone verte sur la vidéo :
                  </span>
                  <p className="mt-0.5 text-neutral-400 text-xs">
                    L'affichage est réglé à 100% sans zoom forcé. Utilisez les préréglages 1-clic ou les curseurs pour cadrer uniquement le lecteur vidéo.
                  </p>
                </div>
              </div>

              {/* 1-Click Quick Simple Presets */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#141F18] border border-white/[0.08]">
                <span className="text-xs font-bold text-[#00FF87] mr-1">Préréglages 1-Clic :</span>
                <button
                  type="button"
                  onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100, zoom: 1.0 })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    crop.width === 100 && crop.x === 0 && crop.zoom === 1.0
                      ? 'bg-[#00FF87] text-[#080C0A]'
                      : 'bg-white/[0.06] text-neutral-200 hover:bg-white/[0.1]'
                  }`}
                >
                  🎯 Plein Cadre (100% de la source)
                </button>
                <button
                  type="button"
                  onClick={() => setCrop({ x: 5, y: 15, width: 90, height: 75, zoom: 1.0 })}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors"
                >
                  📺 Lecteur Centré (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setCrop({ x: 0, y: 10, width: 100, height: 80, zoom: 1.05 })}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-200 transition-colors"
                >
                  📐 Format 16:9 Sport
                </button>
                <button
                  type="button"
                  onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100, zoom: 1.0 })}
                  className="ml-auto text-xs text-neutral-400 hover:text-white underline"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Simple Clean Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#141F18] border border-white/[0.08] text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Position Horizontale</span>
                    <span className="text-[#00FF87] font-mono">{crop.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={crop.x}
                    onChange={(e) => setCrop({ ...crop, x: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                    <span>Gauche</span>
                    <span>Droite</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Position Verticale</span>
                    <span className="text-[#00FF87] font-mono">{crop.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={crop.y}
                    onChange={(e) => setCrop({ ...crop, y: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                    <span>Haut</span>
                    <span>Bas</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Taille / Largeur</span>
                    <span className="text-[#00FF87] font-mono">{crop.width}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={crop.width}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCrop({ ...crop, width: val, height: Math.min(100, val) });
                    }}
                    className="w-full accent-[#00FF87]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                    <span>Serré</span>
                    <span>Large</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-neutral-300 mb-1">
                    <span>Zoom</span>
                    <span className="text-[#00FF87] font-mono">{crop.zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.8"
                    step="0.05"
                    value={crop.zoom}
                    onChange={(e) => setCrop({ ...crop, zoom: Number(e.target.value) })}
                    className="w-full accent-[#00FF87]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                    <span>1.0x (Normal)</span>
                    <span>1.8x</span>
                  </div>
                </div>
              </div>

              {/* Two Column Large Preview: Source with box vs Visitor Result */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Source with crop box */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-400 block">
                    1. Zone sélectionnée (Cadre vert sur la source)
                  </span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.1] bg-black shadow-lg">
                    {capturedMediaStream ? (
                      <video
                        ref={videoCropSourceRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain opacity-50 pointer-events-none"
                      />
                    ) : (
                      <iframe
                        src={
                          activeIframeUrl.startsWith('http')
                            ? `/api/proxy?url=${encodeURIComponent(activeIframeUrl)}`
                            : activeIframeUrl
                        }
                        title="Source Reference"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                        className="w-full h-full border-0 pointer-events-none opacity-50"
                      />
                    )}

                    {/* Green bounding box */}
                    <div
                      style={{
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                        height: `${crop.height}%`,
                      }}
                      className="absolute border-2 border-[#00FF87] bg-[#00FF87]/15 pointer-events-none shadow-lg shadow-[#00FF87]/30 transition-all flex items-center justify-center"
                    >
                      <div className="bg-[#080C0A]/90 px-3 py-1 rounded-md text-[11px] font-bold text-[#00FF87] border border-[#00FF87]/40 shadow-sm">
                        Zone de diffusion captée
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visitor isolated view */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#00FF87] block flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>2. Ce que verront les spectateurs (Rendu final hermétique)</span>
                  </span>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#00FF87] bg-black flex items-center justify-center shadow-lg">
                    <div className="w-full h-full overflow-hidden relative">
                      {capturedMediaStream ? (
                        <video
                          ref={videoCropTargetRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            position: 'absolute',
                            width: `${(100 / crop.width) * 100 * crop.zoom}%`,
                            height: `${(100 / crop.height) * 100 * crop.zoom}%`,
                            left: `-${(crop.x / crop.width) * 100 * crop.zoom}%`,
                            top: `-${(crop.y / crop.height) * 100 * crop.zoom}%`,
                            pointerEvents: 'none',
                          }}
                          className="object-contain"
                        />
                      ) : (
                        <iframe
                          src={
                            activeIframeUrl.startsWith('http')
                              ? `/api/proxy?url=${encodeURIComponent(activeIframeUrl)}`
                              : activeIframeUrl
                          }
                          title="Cropped Visitor Result"
                          style={{
                            position: 'absolute',
                            width: `${(100 / crop.width) * 100 * crop.zoom}%`,
                            height: `${(100 / crop.height) * 100 * crop.zoom}%`,
                            left: `-${(crop.x / crop.width) * 100 * crop.zoom}%`,
                            top: `-${(crop.y / crop.height) * 100 * crop.zoom}%`,
                            pointerEvents: 'none',
                          }}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                          className="border-0"
                        />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-black/80 border border-[#00FF87]/40 text-[10px] text-[#00FF87] font-bold">
                      Aperçu Spectateur HD
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Revenir à la source</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveStream}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-lg shadow-[#00FF87]/25 hover:scale-105 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer & Diffuser le match</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
