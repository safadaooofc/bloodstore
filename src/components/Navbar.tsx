import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, Menu, X, ExternalLink, ShoppingCart, UserCheck, LogOut, Package } from 'lucide-react';

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
      {/* Main Bar */}
      <nav className="navbar-bar">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="navbar-brand cursor-pointer"
        >
          <div className="navbar-logo-box">
            <img 
              src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi.png" 
              alt="Crest" 
            />
          </div>
          <div className="text-xl font-bold font-display text-white tracking-tight hover:text-[#ff003c] transition-colors">
            {config.storeName}
          </div>
        </div>

        {/* Desktop Links */}
        <div className="navbar-links">
          <button 
            onClick={() => handleNavClick('home')}
            style={{ background: 'transparent', border: 'none', color: activeView === 'home' ? '#ff003c' : '#d0d0e0', fontWeight: activeView === 'home' ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.9rem', position: 'relative', padding: '0.3rem 0' }}
          >
            INÍCIO
            {activeView === 'home' && (
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#ff003c' }} className="neon-glow" />
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
            style={{ background: 'transparent', border: 'none', color: activeView === 'terms' ? '#ff003c' : '#d0d0e0', fontWeight: activeView === 'terms' ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative', padding: '0.3rem 0' }}
          >
            <Shield style={{ width: '15px', height: '15px', color: '#ff003c' }} />
            TERMOS E CONDIÇÕES
            {activeView === 'terms' && (
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#ff003c' }} className="neon-glow" />
            )}
          </button>

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#d0d0e0', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>SUPORTE</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        </div>

        {/* Desktop CTA & Cart & Discord Login */}
        <div className="hidden md:flex items-center gap-2.5">
          <button 
            onClick={() => setActiveView('checkout')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#121118] hover:bg-[#1c1a26] border border-[#ff003c]/60 hover:border-[#ff003c] rounded-lg text-xs font-bold text-white transition-all relative shadow-[0_0_10px_rgba(255,0,60,0.15)]"
          >
            <ShoppingCart className="w-4 h-4 text-[#ff003c]" />
            <span>CARRINHO</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ff003c] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
                {totalQuantity}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAccountModal}
                className="flex items-center gap-2 bg-[#16141e] hover:bg-[#201d2c] border border-[#ff003c]/40 hover:border-[#ff003c] px-3 py-1 rounded-lg transition-all cursor-pointer shadow-sm group"
                title="Abrir Minha Conta e Meus Pedidos"
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username} 
                  className="w-5 h-5 rounded-full border border-[#ff003c]"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1 group-hover:text-[#ff003c]">
                    <span>{currentUser.globalName}</span>
                    <Package className="w-3.5 h-3.5 text-[#ff003c]" />
                  </div>
                </div>
              </button>

              <button 
                onClick={logoutDiscord}
                title="Sair do Discord"
                className="p-1.5 bg-[#16141e] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#16141e] hover:bg-[#201d2c] border border-[#ff003c]/40 hover:border-[#ff003c] text-white font-bold text-xs rounded-lg transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#ff003c]" />
              <span>Acesso ao Portal</span>
            </button>
          )}

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 bg-[#121218] hover:bg-[#1a1a24] border border-[#ff003c]/60 hover:border-[#ff003c] text-white font-bold text-xs py-1.5 px-3.5 rounded-lg transition-all shadow-sm no-underline"
          >
            <span>CENTRAL DE ATENDIMENTO</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#ff003c]" />
          </a>
        </div>

        {/* Mobile Buttons (Cart + Menu Toggle) */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={onOpenAccountModal}
                className="flex items-center gap-1.5 bg-[#16141e] border border-[#ff003c]/40 px-2 py-1 rounded-lg"
              >
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full border border-[#ff003c]" />
                <Package className="w-3.5 h-3.5 text-[#ff003c]" />
              </button>
              <button onClick={logoutDiscord} className="p-1 text-slate-400 hover:text-red-400">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="p-1.5 bg-[#16141e] border border-[#ff003c]/40 text-white rounded-lg text-xs flex items-center gap-1"
              title="Login Discord"
            >
              <UserCheck className="w-4 h-4 text-[#ff003c]" />
            </button>
          )}

          <button 
            onClick={() => setActiveView('checkout')}
            className="p-2 bg-[#121118] border border-[#ff003c]/50 text-white rounded-lg relative flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 text-[#ff003c]" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ff003c] text-white rounded-full px-1.5 py-0.2 text-[9px] font-bold">
                {totalQuantity}
              </span>
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-[#16141e] border border-white/10 text-slate-300 hover:text-white rounded-lg block"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0e] border-b border-[#ff003c]/30 p-5 flex flex-col gap-3">
          {currentUser && (
            <div className="p-3 bg-[#16141e] rounded-xl border border-white/10 mb-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5" onClick={() => { setMobileMenuOpen(false); onOpenAccountModal?.(); }}>
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-[#ff003c]" />
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.globalName}</div>
                    <div className="text-xs text-slate-400">@{currentUser.username}</div>
                  </div>
                </div>
                <button onClick={logoutDiscord} className="text-xs font-semibold text-red-400 hover:text-red-300">Sair</button>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAccountModal?.(); }}
                className="w-full py-2 bg-[#ff003c] hover:bg-[#d90033] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
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
              <ShoppingCart className="w-4 h-4 text-[#ff003c]" />
              <span>Carrinho ({totalQuantity})</span>
            </span>
            <span className="text-xs text-[#ff003c]">Ver itens</span>
          </button>

          {!currentUser && (
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal?.(); }}
              className="w-full py-2.5 mt-2 bg-[#16141e] border border-[#ff003c]/50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <UserCheck className="w-4 h-4 text-[#ff003c]" />
              <span>Conectar ao Portal</span>
            </button>
          )}

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2 font-semibold text-sm text-[#ff003c] no-underline"
          >
            <span>Canal de Suporte Oficial</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
};
