import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Shield,
  Smile,
  Trash2,
  Users,
  MessageSquare,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveChatProps {
  streamId: string;
  isAdmin: boolean;
  viewerCount: number;
}

const EMOJIS = ['⚽', '🔥', '🏆', '👏', '🟥', '🟨', '😱', '🍿', '⚡'];

export const LiveChat: React.FC<LiveChatProps> = ({ streamId, isAdmin, viewerCount }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('novafoot_nickname') || '';
  });
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [isSlowMode, setIsSlowMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat/${streamId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.warn('Could not load chat messages:', err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => clearInterval(interval);
  }, [streamId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Check if nickname exists
    if (!nickname.trim()) {
      setShowNicknameModal(true);
      return;
    }

    if (isSlowMode) return;

    const messagePayload = {
      streamId,
      sender: isAdmin ? `${nickname} (Staff)` : nickname,
      text: inputText.trim(),
      isAdmin,
      avatarColor: isAdmin ? '#00FF87' : '#3B82F6',
    };

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      id: `opt-${Date.now()}`,
      timestamp: "À l'instant",
      ...messagePayload,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    // Trigger slowmode cooldown
    setIsSlowMode(true);
    setTimeout(() => setIsSlowMode(false), 2000);

    try {
      const res = await fetch(`/api/chat/${streamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
      });
      if (res.ok) {
        const saved = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimisticMessage.id ? saved : m)));
      }
    } catch (err) {
      console.warn('Error saving chat message:', err);
    }
  };

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempNickname.trim()) return;
    const cleanNick = tempNickname.trim().substring(0, 20);
    setNickname(cleanNick);
    localStorage.setItem('novafoot_nickname', cleanNick);
    setShowNicknameModal(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await fetch(`/api/chat/${streamId}/${messageId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Error deleting message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B100D] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#111A15] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00FF87]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Chat en direct</h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18261F] border border-[#00FF87]/20 text-[11px] font-semibold text-neutral-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF87]" />
          </span>
          <Users className="w-3 h-3 text-[#00FF87]" />
          <span className="tabular-nums text-white">{viewerCount}</span>
        </div>
      </div>

      {/* Messages stream area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs text-neutral-200 min-h-[350px] max-h-[550px]">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-xs">
            <span>Soyez le premier à commenter le match !</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`group flex items-start gap-2 p-2 rounded-xl transition-colors ${
                msg.isAdmin ? 'bg-[#00FF87]/08 border border-[#00FF87]/20' : 'hover:bg-white/[0.03]'
              }`}
            >
              {/* Avatar circle */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-[#080C0A] shrink-0 mt-0.5"
                style={{
                  backgroundColor: msg.isAdmin ? '#00FF87' : msg.avatarColor || '#3B82F6',
                }}
              >
                {msg.sender.substring(0, 1).toUpperCase()}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-bold text-xs ${
                      msg.isAdmin ? 'text-[#00FF87]' : 'text-neutral-300'
                    }`}
                  >
                    {msg.sender}
                  </span>

                  {/* ADMIN BADGE (Only for admin accounts as specified) */}
                  {msg.isAdmin && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-[#00FF87] text-[#080C0A] text-[9px] font-black uppercase tracking-wider">
                      <Shield className="w-2.5 h-2.5 fill-current" />
                      ADMIN
                    </span>
                  )}

                  <span className="text-[10px] text-neutral-500 ml-auto">
                    {msg.timestamp || "À l'instant"}
                  </span>
                </div>

                <p className="text-xs text-neutral-200 mt-0.5 leading-relaxed break-words">
                  {msg.text}
                </p>
              </div>

              {/* Admin moderation delete button */}
              {isAdmin && (
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-500/20 transition-opacity"
                  title="Supprimer ce message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Bar */}
      <div className="px-3 py-1.5 bg-[#0D1410] border-t border-white/[0.05] flex items-center gap-1.5 overflow-x-auto">
        <Smile className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1" />
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setInputText((prev) => prev + emoji)}
            className="hover:scale-125 transition-transform text-sm p-0.5"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Nickname & Chat Input Form */}
      <div className="p-3 bg-[#111A15] border-t border-white/[0.08]">
        {!nickname ? (
          <button
            type="button"
            onClick={() => setShowNicknameModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#00FF87]/15 hover:bg-[#00FF87]/25 text-[#00FF87] border border-[#00FF87]/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Créer un pseudo pour chatter</span>
          </button>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
              <span className="flex items-center gap-1">
                Chat en tant que :{' '}
                <strong className={isAdmin ? 'text-[#00FF87]' : 'text-white'}>
                  {nickname}
                </strong>
                {isAdmin && (
                  <span className="px-1 py-0.2 rounded bg-[#00FF87]/20 text-[#00FF87] text-[9px] font-bold">
                    STAFF
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowNicknameModal(true)}
                className="text-[10px] text-neutral-400 hover:text-white underline"
              >
                Changer
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Envoyer un message au chat..."
                maxLength={300}
                className="w-full pl-3 pr-10 py-2 rounded-xl bg-[#16221B] border border-white/[0.1] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00FF87]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSlowMode}
                className="absolute right-1.5 p-1.5 rounded-lg bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] disabled:opacity-40 transition-all active:scale-95"
                title="Envoyer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nickname Prompt Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0D1410] border border-[#00FF87]/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00FF87]/20 border border-[#00FF87]/30 flex items-center justify-center text-[#00FF87]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Création de ton pseudo</h4>
                <p className="text-[11px] text-neutral-400">Requis pour participer au chat en direct</p>
              </div>
            </div>

            <form onSubmit={handleSaveNickname} className="space-y-3">
              <input
                type="text"
                autoFocus
                required
                maxLength={20}
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="Ton pseudo (ex: Footballeur92)"
                className="w-full px-3 py-2 rounded-xl bg-[#141F18] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-[#00FF87]"
              />
              <div className="flex justify-end gap-2 pt-1">
                {nickname && (
                  <button
                    type="button"
                    onClick={() => setShowNicknameModal(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!tempNickname.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#00FF87] hover:bg-[#00e57a] text-[#080C0A] text-xs font-bold transition-all shadow-md shadow-[#00FF87]/20 disabled:opacity-40"
                >
                  Valider mon pseudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
