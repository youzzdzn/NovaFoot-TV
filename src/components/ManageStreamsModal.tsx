import React from 'react';
import { X, Star, Trash2, Radio, Clock, Eye, AlertCircle, PlusCircle } from 'lucide-react';
import { Stream } from '../types';

interface ManageStreamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streams: Stream[];
  onToggleFeatured: (id: string) => void;
  onDeleteStream: (id: string) => void;
  onSelectStream: (id: string) => void;
  onOpenCreateStream: () => void;
}

export const ManageStreamsModal: React.FC<ManageStreamsModalProps> = ({
  isOpen,
  onClose,
  streams,
  onToggleFeatured,
  onDeleteStream,
  onSelectStream,
  onOpenCreateStream,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0B100D] border border-[#00FF87]/30 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00FF87]/15 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gestionnaire des diffusions</h3>
              <p className="text-xs text-neutral-400">
                Mettre à la une, basculer les flux ou supprimer des programmes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateStream();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Créer une diffusion</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Streams List */}
        <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
          {streams.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
              <span>Aucune diffusion disponible pour le moment.</span>
            </div>
          ) : (
            streams.map((stream) => (
              <div
                key={stream.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-[#121A15] border border-white/[0.08] hover:border-white/[0.15] transition-all"
              >
                <div
                  onClick={() => {
                    onSelectStream(stream.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                >
                  <img
                    src={stream.coverUrl}
                    alt={stream.title}
                    className="w-16 h-10 rounded-lg object-cover border border-white/[0.1] shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-[#00FF87] transition-colors">
                        {stream.title}
                      </span>
                      {stream.isFeatured && (
                        <span className="px-1.5 py-0.2 rounded bg-[#00FF87]/20 text-[#00FF87] text-[10px] font-bold uppercase tracking-wider shrink-0 border border-[#00FF87]/30">
                          À la une
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                      <span>{stream.league}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#00FF87]" />
                        <span className="tabular-nums">{stream.viewers} spectateurs</span>
                      </span>
                      <span>·</span>
                      <span className="capitalize text-neutral-300">
                        {stream.status === 'live' ? '🔴 En direct' : '⏱️ À venir'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onToggleFeatured(stream.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      stream.isFeatured
                        ? 'bg-[#00FF87]/20 border-[#00FF87] text-[#00FF87]'
                        : 'bg-white/[0.05] border-white/[0.1] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                    title={
                      stream.isFeatured
                        ? 'Cette diffusion est déjà à la une'
                        : 'Mettre cette diffusion à la une'
                    }
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        stream.isFeatured ? 'fill-current text-[#00FF87]' : ''
                      }`}
                    />
                    <span>{stream.isFeatured ? 'En Vedette' : 'Mettre à la une'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer définitivement la diffusion "${stream.title}" ?`)) {
                        onDeleteStream(stream.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                    title="Supprimer la diffusion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
