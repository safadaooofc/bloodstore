import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { TermsSection } from '../components/TermsSection';
import { Footer } from '../components/Footer';

export const StoreFront = ({ onOpenAdmin, onOpenCheckout }) => {
  const handleSelectProduct = (prod) => {
    try {
      sessionStorage.setItem('bloodstore_checkout_item', JSON.stringify(prod));
    } catch (e) {
      console.error("Erro ao salvar no sessionStorage:", e);
    }
    if (onOpenCheckout) {
      onOpenCheckout(prod);
    } else {
      window.location.hash = `#/checkout?id=${prod.id}`;
    }
  };

  return (
    <div className="store-front-wrap">
      <Navbar onOpenAdmin={onOpenAdmin} />
      <Hero />
      <ProductGrid onSelectProduct={handleSelectProduct} />
      <TermsSection />
      <Footer />
    </div>
  );
};
