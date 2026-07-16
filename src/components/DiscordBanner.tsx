import React from 'react';
import { useStore } from '../context/StoreContext';
import { ExternalLink, Users, ShieldCheck, Zap } from 'lucide-react';

export const DiscordBanner: React.FC = () => {
  const { config } = useStore();

  return (
    <section className="container-main">
      <div className="discord-banner-box">
        {/* Subtle Corporate Ambient Red Glow */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(255, 0, 60, 0.12)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Left Content */}
        <div style={{ maxWidth: '600px', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.35rem 0.9rem', background: 'rgba(255, 0, 60, 0.15)', border: '1px solid var(--color-neon-red)', color: 'var(--color-neon-red)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem', borderRadius: '6px' }}>
            <span className="w-2 h-2 rounded-full bg-[#ff003c]" />
            <span>CANAL OFICIAL DE ATENDIMENTO</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '1rem' }}>
            ACESSE NOSSO PORTAL <span style={{ color: 'var(--color-neon-red)' }}>DISCORD</span>
          </h2>

          <p style={{ color: '#c0c0d0', fontSize: '1rem', fontWeight: 300, lineHeight: 1.6, marginBottom: '1.8rem' }}>
            Conecte-se ao nosso servidor corporativo no Discord para verificação de pedidos em tempo real, suporte técnico assistido pela nossa equipe e comunicados oficiais.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#e0e0e0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ width: '18px', height: '18px', color: 'var(--color-neon-red)' }} />
              <span>+{config.stats.activeUsers.toLocaleString()} Clientes Conectados</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ width: '18px', height: '18px', color: '#ff003c' }} />
              <span>Atendimento Técnico Especializado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap style={{ width: '18px', height: '18px', color: '#ff003c' }} />
              <span>Acompanhamento Direto em Tempo Real</span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '16px', border: '1px solid var(--color-neon-red)', overflow: 'hidden', background: '#121218', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <img 
              src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi.png" 
              alt="Crest" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <a 
            href={config.globalDiscordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber"
            style={{ padding: '1rem 2.2rem', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
          >
            <span>ACESSAR SUPORTE OFICIAL</span>
            <ExternalLink style={{ width: '18px', height: '18px' }} />
          </a>

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#888899', textTransform: 'uppercase' }}>
            Acesso Imediato
          </span>
        </div>
      </div>
    </section>
  );
};
