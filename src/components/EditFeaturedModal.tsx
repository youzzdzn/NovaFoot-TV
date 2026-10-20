import React, { useState } from 'react';
import { X, Sparkles, Check, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { FeaturedHeroConfig } from '../types';

interface EditFeaturedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: FeaturedHeroConfig;
  onSave: (config: FeaturedHeroConfig) => void;
}

export const EditFeaturedModal: React.FC<EditFeaturedModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [title, setTitle] = useState(
    currentConfig?.title || 'Grand Choc Européen en Direct'
  );
  const [subtitle, setSubtitle] = useState(
    currentConfig?.subtitle ||
      'Suivez les plus grands matches en qualité 1080p avec chat en direct et écrans de situation en temps réel.'
  );
  const [badgeText, setBadgeText] = useState(
    currentConfig?.badgeText || 'À la Une · Événement'
  );
  const [coverUrl, setCoverUrl] = useState(currentConfig?.coverUrl || '');
  const [buttonText, setButtonText] = useState(
    currentConfig?.buttonText || 'Rejoindre le direct'
  );
  const [buttonLink, setButtonLink] = useState(currentConfig?.buttonLink || '');
  const [coverError, setCoverError] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      subtitle,
      badgeText,
      coverUrl,
      buttonText,
      buttonLink,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0B100D] border border-[#00FF87]/30 rounded-2xl shadow-2xl p-6 relative overflow-hidden my-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personnaliser l'écran à la une</h3>
            <p className="text-xs text-neutral-400">
              Modifiez le texte, le badge et l'image de la bannière principale d'accueil
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Titre principal *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Paris Saint-Germain vs Real Madrid"
              className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Texte du badge
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ex: À la Une · Ligue des Champions"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Texte du bouton CTA
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Ex: Regarder le match"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Description / Sous-titre
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Texte de présentation de l'affiche..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
            />
          </div>

          {/* Cover image input & LIVE PREVIEW */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Image d'arrière-plan de la une (Cover)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  setCoverError(false);
                }}
                placeholder="https://.../image.jpg ou uploader"
                className="flex-1 px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#00FF87]"
              />
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5 text-[#00FF87]" />
                <span>Upload</span>
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
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live 16:9 preview */}
            <div className="mt-2">
              <span className="text-[11px] text-neutral-400 block mb-1">
                Prévisualisation de l'image :
              </span>
              {coverUrl && !coverError ? (
                <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-[#00FF87]/40 bg-black">
                  <img
                    src={coverUrl}
                    alt="Aperçu Une"
                    onError={() => setCoverError(true)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#00FF87] font-bold">
                    ✓ Image active
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-white/[0.1] bg-[#121B16] text-center text-xs text-neutral-500 max-w-sm flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4 text-neutral-600" />
                  <span>Aucune image (un fond vert sombre sera utilisé)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer l'écran à la une</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
