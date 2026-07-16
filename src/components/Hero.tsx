import React from 'react';
import { useStore } from '../context/StoreContext';
import { Zap, ShieldCheck, Clock, ArrowDown, ExternalLink, Sparkles, Activity } from 'lucide-react';

export const Hero: React.FC = () => {
  const { config } = useStore();

  const handleScrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('produtos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      {/* Corporate Ambient Red Glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', maxWidth: '900px', height: '280px', background: 'rgba(255, 0, 60, 0.12)', filter: 'blur(130px)', pointerEvents: 'none', borderRadius: '50%' }} />
      
      <div className="hero-content">
        {/* Professional Status Pill */}
        <div className="status-pill animate-float">
          <span className="w-2 h-2 rounded-full bg-[#ff003c]" />
          <span style={{ color: 'var(--color-neon-red)', fontWeight: 700 }}>PORTAL OFICIAL </span>
          <span style={{ color: '#666677' }}>•</span>
          <span>SISTEMA OPERACIONAL ATIVO </span>
          <Activity style={{ width: '14px', height: '14px', color: 'var(--color-neon-red)', marginLeft: '4px' }} />
        </div>

        {/* Brand Crest Box */}
        <div className="brand-crest-box">
          <div className="brand-crest-circle neon-glow">
            <img 
              src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi (1).png" 
              alt="Blood Store Official Crest" 
            />
          </div>
          <div className="brand-crest-badge">
            PORTAL DE SOLUÇÕES
          </div>
        </div>

        {/* Executive Title */}
        <h1 className="hero-title">
          {config.bannerTitle.split(' ').map((word, i) => (
            <span 
              key={i} 
              className="word-item"
              style={{ color: i % 3 === 1 || word.toLowerCase().includes('soluções') || word.toLowerCase().includes('licenças') ? 'var(--color-neon-red)' : '#ffffff' }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          {config.bannerSubtitle}
        </p>

        {/* 4 Professional Feature Badges Grid */}
        <div className="hero-badges-grid">
          <div className="badge-card hud-card">
            <div className="badge-icon">
              <Zap style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div className="badge-text-label">Entrega Automatizada</div>
              <div className="badge-text-value">Disponibilização Rápida</div>
            </div>
          </div>

          <div className="badge-card hud-card">
            <div className="badge-icon">
              <ShieldCheck style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div className="badge-text-label">Autenticidade & Garantia</div>
              <div className="badge-text-value">Ativos Verificados</div>
            </div>
          </div>

          <div className="badge-card hud-card">
            <div className="badge-icon">
              <Clock style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div className="badge-text-label">Atendimento Humanizado</div>
              <div className="badge-text-value">Suporte Especializado</div>
            </div>
          </div>

          <div className="badge-card hud-card">
            <div className="badge-icon">
              <Sparkles style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div className="badge-text-label">Processamento Seguro</div>
              <div className="badge-text-value" style={{ color: 'var(--color-neon-red)' }}>PIX Instantâneo</div>
            </div>
          </div>
        </div>

        {/* Centered Executive CTA Buttons */}
        <div className="hero-cta-group">
          <a 
            href="#produtos"
            onClick={handleScrollToProducts}
            className="btn-cyber"
          >
            <span>ACESSAR CATÁLOGO</span>
            <ArrowDown style={{ width: '18px', height: '18px' }} />
          </a>

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber-outline"
          >
            <span>PORTAL DE ATENDIMENTO</span>
            <ExternalLink style={{ width: '16px', height: '16px' }} />
          </a>
        </div>

        {/* Centered 4-Column Professional Stats Grid */}
        <div className="stats-grid">
          <div>
            <div className="stat-number">
              +{config.stats.totalSales.toLocaleString()}
            </div>
            <div className="stat-label">Transações Concluídas</div>
          </div>
          <div>
            <div className="stat-number" style={{ color: 'var(--color-neon-red)' }}>
              +{config.stats.activeUsers.toLocaleString()}
            </div>
            <div className="stat-label">Clientes Ativos</div>
          </div>
          <div>
            <div className="stat-number">
              {config.stats.satisfactionRate}
            </div>
            <div className="stat-label">Índice de Satisfação</div>
          </div>
          <div>
            <div className="stat-number" style={{ color: 'var(--color-neon-red)' }}>
              ~{config.stats.averageDelivery}
            </div>
            <div className="stat-label">Tempo Médio de Atendimento</div>
          </div>
        </div>
      </div>
    </section>
  );
};
