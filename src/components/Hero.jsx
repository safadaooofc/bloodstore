import React from 'react';
import { useStore } from '../context/StoreContext';

export const Hero = () => {
  const { config } = useStore();

  return (
    <section id="inicio" className="hero">
      <video 
        className="hero-video-bg" 
        autoPlay 
        loop 
        muted 
        playsInline 
        onError={(e) => { e.target.style.display = 'none'; }}
      >
        <source src="/fotos e videos/banner.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>

      <div className="container hero-content">
        <span className="hero-badge"><i className="fa-solid fa-bolt"></i> Entrega Rápida & Garantia Total</span>
        <h1 className="hero-title">{config.storeName}</h1>
        <p className="hero-slogan">{config.slogan}</p>
        <a href="#catalogo" className="btn-hero">
          Ver Catálogo <i className="fa-solid fa-arrow-down"></i>
        </a>
      </div>
    </section>
  );
};
