import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShieldCheck, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import type { DiscordUser } from '../../types/store';

interface DiscordLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordLoginModal: React.FC<DiscordLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginDiscord } = useStore();
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = usernameInput.trim();
    if (!cleanUser || cleanUser.length < 2) {
      setError('Por favor, digite seu usuário ou nick do Discord.');
      return;
    }

    const avatarIndices = ['0', '1', '2', '3', '4', '5'];
    const charCodeSum = cleanUser.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = avatarIndices[charCodeSum % avatarIndices.length];

    const newUser: DiscordUser = {
      id: `discord-${Date.now()}`,
      username: cleanUser,
      globalName: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
      email: emailInput.trim() || `${cleanUser.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@discord.user`,
      avatarUrl: `https://cdn.discordapp.com/embed/avatars/${avatarIndex}.png`,
      joinedAt: new Date().toLocaleDateString('pt-BR')
    };

    loginDiscord(newUser);
    setError(null);
    onClose();
  };

  const handleQuickDemoLogin = (username: string, globalName: string, email: string, avatarNum: number) => {
    loginDiscord({
      id: `demo-${Date.now()}`,
      username,
      globalName,
      email,
      avatarUrl: `https://cdn.discordapp.com/embed/avatars/${avatarNum}.png`,
      joinedAt: new Date().toLocaleDateString('pt-BR')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#0f0e14] border border-[#ff003c]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#16141e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff003c]/20 border border-[#ff003c]/40 flex items-center justify-center text-[#ff003c]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Conectar com Discord</h3>
              <p className="text-xs text-slate-400">Acesse sua conta para agilizar suas compras</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <span className="font-bold">Aviso:</span> {error}
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Seu Nickname / Usuário no Discord *
              </label>
              <input 
                type="text"
                required
                placeholder="Ex: lucas.gamer ou Lucas#1234"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ backgroundColor: '#141622', color: '#ffffff' }}
                className="w-full px-4 py-2.5 bg-[#141622] border border-white/12 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#ff003c] placeholder:text-slate-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail de Contato (Opcional)
              </label>
              <input 
                type="email"
                placeholder="Para envio de recibos (ex: lucas@email.com)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ backgroundColor: '#141622', color: '#ffffff' }}
                className="w-full px-4 py-2.5 bg-[#141622] border border-white/12 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#ff003c] placeholder:text-slate-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#ff003c] hover:bg-[#d90033] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#ff003c]/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Conectar Conta Discord</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#ff003c]" />
              <span>Ou escolha um perfil rápido para teste:</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('kiover.dev', 'Kiover Dev', 'kiover@bloodstore.dev', 1)}
                className="p-2.5 bg-[#16141e] hover:bg-[#201d2c] border border-white/10 hover:border-[#ff003c]/50 rounded-xl text-left transition-all flex items-center gap-2.5"
              >
                <img 
                  src="https://cdn.discordapp.com/embed/avatars/1.png" 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full border border-[#ff003c]/50"
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">Kiover Dev</div>
                  <div className="text-[10px] text-slate-400 truncate">@kiover.dev</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('cliente.vip', 'Cliente Corporativo', 'contato@empresa.com', 3)}
                className="p-2.5 bg-[#16141e] hover:bg-[#201d2c] border border-white/10 hover:border-[#ff003c]/50 rounded-xl text-left transition-all flex items-center gap-2.5"
              >
                <img 
                  src="https://cdn.discordapp.com/embed/avatars/3.png" 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full border border-[#ff003c]/50"
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">Cliente Corporativo</div>
                  <div className="text-[10px] text-slate-400 truncate">@cliente.vip</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#ff003c]" />
            <span>Seus dados ficam salvos de forma segura em seu navegador.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
