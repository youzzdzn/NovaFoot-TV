import React, { useState } from 'react';
import { X, Sparkles, Check, Upload, Palette } from 'lucide-react';
import { CustomOverlayConfig } from '../types';

interface CustomOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: CustomOverlayConfig;
  onSave: (config: CustomOverlayConfig) => void;
}

export const CustomOverlayModal: React.FC<CustomOverlayModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onSave,
}) => {
  const [title, setTitle] = useState(
    initialConfig?.title || 'Grand Match de Clôture'
  );
  const [subtitle, setSubtitle] = useState(
    initialConfig?.subtitle ||
      'La retransmission reprendra dans quelques instants après l\'annonce des compositions officielles.'
  );
  const [badgeText, setBadgeText] = useState(
    initialConfig?.badgeText || 'Direct Spécial'
  );
  const [badgeColor, setBadgeColor] = useState(
    initialConfig?.badgeColor || '#00FF87'
  );
  const [icon, setIcon] = useState<
    'alert' | 'trophy' | 'pause' | 'football' | 'message' | 'shield'
  >(initialConfig?.icon || 'shield');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    initialConfig?.backgroundImageUrl || ''
  );
  const [buttonText, setButtonText] = useState(
    initialConfig?.buttonText || 'Rejoindre le salon VIP'
  );
  const [buttonUrl, setButtonUrl] = useState(
    initialConfig?.buttonUrl || 'https://discord.gg/fKWtyTyNry'
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBackgroundImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      subtitle,
      badgeText,
      badgeColor,
      icon,
      backgroundImageUrl,
      buttonText,
      buttonUrl,
    });
    onClose();
  };

  const PRESET_COLORS = ['#00FF87', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0D1410] border border-[#00FF87]/30 rounded-2xl shadow-2xl p-6 relative overflow-hidden my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Créer un écran de situation personnalisé</h3>
            <p className="text-xs text-neutral-400">
              Personnalisez le texte, la couleur, l'icône, l'image et le bouton d'action
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Titre principal *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Sous-titre / Message informatif
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Texte du badge
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ex: Flash Info"
                className="w-full px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Couleur du thème
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div className="flex items-center gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBadgeColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        badgeColor === c ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Icône centrale
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { id: 'shield', label: 'Bouclier' },
                { id: 'trophy', label: 'Trophée' },
                { id: 'pause', label: 'Pause' },
                { id: 'football', label: 'Football' },
                { id: 'message', label: 'Message' },
                { id: 'alert', label: 'Alerte' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id as any)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    icon === item.id
                      ? 'border-[#00FF87] bg-[#00FF87]/20 text-[#00FF87]'
                      : 'border-white/[0.08] bg-[#141F18] text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Background image */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Image d'arrière-plan optionnelle
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={backgroundImageUrl}
                onChange={(e) => setBackgroundImageUrl(e.target.value)}
                placeholder="https://... ou uploader"
                className="flex-1 px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#00FF87]"
              />
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#00FF87]" />
                <span className="hidden sm:inline">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Libellé du bouton (Optionnel)
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Ex: Rejoindre le Discord"
                className="w-full px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Lien URL du bouton
              </label>
              <input
                type="url"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-[#00FF87]"
              />
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20"
            >
              <Check className="w-4 h-4" />
              <span>Appliquer cet écran personnalisé</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
