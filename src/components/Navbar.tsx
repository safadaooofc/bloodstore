import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, Menu, X, ExternalLink, Sparkles, ShoppingCart, UserCheck, LogOut, Package } from 'lucide-react';

interface NavbarProps {
  onOpenAuthModal?: () => void;
  onOpenAccountModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onOpenAccountModal }) => {
  const { config, activeView, setActiveView, cart, currentUser, logoutDiscord } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalQuantity = cart.reduce((a, b) => a + b.quantity, 0);

  const handleNavClick = (view: 'home' | 'terms') => {
    setActiveView(view);
    setMobileMenuOpen(false);
    if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        const el = document.getElementById('produtos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('produtos');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      {/* Announcement Bar */}
      {config.announcementBanner && (
        <div className="w-full bg-[#1e293b]/80 border-b border-white/10 py-2 px-4 text-center text-xs font-medium text-slate-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse" />
          <span>{config.announcementBanner.replace(/\/\//g, '•')}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#4f46e5]" />
        </div>
      )}

      {/* Main Bar */}
      <nav className="navbar-bar">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="navbar-brand"
        >
          <div className="navbar-logo-box">
            <img 
              src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi.png" 
              alt="Crest" 
            />
          </div>
          <div>
            <div className="text-lg font-bold font-display text-white tracking-tight">
              {config.storeName}
            </div>
            <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider -mt-0.5">
              • Oficial & Verificado
            </div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="navbar-links">
          <button 
            onClick={() => handleNavClick('home')}
            style={{ background: 'transparent', border: 'none', color: activeView === 'home' ? 'var(--color-neon-red)' : '#d0d0e0', fontWeight: activeView === 'home' ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.9rem', position: 'relative', padding: '0.3rem 0' }}
          >
            INÍCIO
            {activeView === 'home' && (
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: 'var(--color-neon-red)' }} className="neon-glow" />
            )}
          </button>

          <a 
            href="#produtos"
            onClick={handleScrollToProducts}
            style={{ color: '#d0d0e0', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
          >
            PRODUTOS
          </a>

          <button 
            onClick={() => handleNavClick('terms')}
            style={{ background: 'transparent', border: 'none', color: activeView === 'terms' ? 'var(--color-neon-red)' : '#d0d0e0', fontWeight: activeView === 'terms' ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative', padding: '0.3rem 0' }}
          >
            <Shield style={{ width: '15px', height: '15px', color: 'var(--color-neon-red)' }} />
            TERMOS E CONDIÇÕES
            {activeView === 'terms' && (
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: 'var(--color-neon-red)' }} className="neon-glow" />
            )}
          </button>

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#d0d0e0', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>DISCORD VIP</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        </div>

        {/* Desktop CTA & Cart & Discord Login */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => setActiveView('checkout')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all relative"
          >
            <ShoppingCart className="w-4 h-4 text-[#4f46e5]" />
            <span>CARRINHO</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#4f46e5] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
                {totalQuantity}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAccountModal}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-[#4f46e5]/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm group"
                title="Abrir Minha Conta e Meus Pedidos"
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username} 
                  className="w-6 h-6 rounded-full border border-[#4f46e5]"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1 group-hover:text-indigo-300">
                    <span>{currentUser.globalName}</span>
                    <Package className="w-3.5 h-3.5 text-[#4f46e5]" />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">Meus Pedidos</div>
                </div>
              </button>

              <button 
                onClick={logoutDiscord}
                title="Sair do Discord"
                className="p-2 bg-slate-800/80 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#5865F2]/25 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login Discord</span>
            </button>
          )}

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber text-xs py-2 px-4"
          >
            <span>SERVIDOR DISCORD</span>
          </a>
        </div>

        {/* Mobile Buttons (Cart + Menu Toggle) */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={onOpenAccountModal}
                className="flex items-center gap-1.5 bg-slate-800/80 border border-[#4f46e5]/40 px-2 py-1 rounded-lg"
              >
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full border border-[#4f46e5]" />
                <Package className="w-3.5 h-3.5 text-[#4f46e5]" />
              </button>
              <button onClick={logoutDiscord} className="p-1 text-slate-400 hover:text-red-400">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="p-1.5 bg-[#5865F2] text-white rounded-lg text-xs flex items-center gap-1"
              title="Login Discord"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => setActiveView('checkout')}
            className="p-2 bg-slate-800 border border-white/10 text-white rounded-lg relative flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 text-[#4f46e5]" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#4f46e5] text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
                {totalQuantity}
              </span>
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-lg block"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-white/10 p-5 flex flex-col gap-3">
          {currentUser && (
            <div className="p-3 bg-slate-800/60 rounded-xl border border-white/10 mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5" onClick={() => { setMobileMenuOpen(false); onOpenAccountModal?.(); }}>
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-[#4f46e5]" />
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.globalName}</div>
                    <div className="text-xs text-slate-400">@{currentUser.username}</div>
                  </div>
                </div>
                <button onClick={logoutDiscord} className="text-xs font-semibold text-red-400 hover:text-red-300">Sair</button>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAccountModal?.(); }}
                className="w-full py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
              >
                <Package className="w-4 h-4" />
                <span>Abrir Meus Pedidos & Contas</span>
              </button>
            </div>
          )}

          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center justify-between py-2 border-b border-white/5 text-left font-semibold text-sm text-white"
          >
            <span>Início</span>
            <span className="text-xs text-slate-400">• 01</span>
          </button>

          <a 
            href="#produtos"
            onClick={handleScrollToProducts}
            className="flex items-center justify-between py-2 border-b border-white/5 font-semibold text-sm text-white no-underline"
          >
            <span>Catálogo de Produtos</span>
            <span className="text-xs text-slate-400">• 02</span>
          </a>

          <button 
            onClick={() => handleNavClick('terms')}
            className="flex items-center justify-between py-2 border-b border-white/5 text-left font-semibold text-sm text-white"
          >
            <span>Termos e Garantia</span>
            <span className="text-xs text-slate-400">• 03</span>
          </button>

          <button 
            onClick={() => { setActiveView('checkout'); setMobileMenuOpen(false); }}
            className="flex items-center justify-between py-2 border-b border-white/5 text-left font-semibold text-sm text-white"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#4f46e5]" />
              <span>Carrinho ({totalQuantity})</span>
            </span>
            <span className="text-xs text-[#4f46e5]">Ver itens</span>
          </button>

          {!currentUser && (
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.(); }}
              className="w-full py-2.5 mt-2 bg-[#5865F2] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>Conectar com Discord</span>
            </button>
          )}

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2 font-semibold text-sm text-[#3b82f6] no-underline"
          >
            <span>Servidor Discord Oficial</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
};
