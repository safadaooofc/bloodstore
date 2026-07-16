import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { TermsSection } from '../components/TermsSection';
import { Footer } from '../components/Footer';
import { SplitCheckoutModal } from '../components/SplitCheckoutModal';

export const StoreFront = ({ onOpenAdmin }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="store-front-wrap">
      <Navbar onOpenAdmin={onOpenAdmin} />
      <Hero />
      <ProductGrid onSelectProduct={(prod) => setSelectedProduct(prod)} />
      <TermsSection />
      <Footer />

      {selectedProduct && (
        <SplitCheckoutModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};
