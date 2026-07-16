import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ onSelectProduct }) => {
  const { products } = useStore();

  return (
    <section id="catalogo" className="section-products">
      <div className="container">
        <div className="section-header">
          <h2>Catálogo de Produtos</h2>
          <p>Selecione o item desejado para iniciar seu atendimento prioritário e gerar o PIX.</p>
        </div>

        <div className="products-grid">
          {products && products.length > 0 ? (
            products.map((prod) => (
              <ProductCard key={prod.id} product={prod} onSelectProduct={onSelectProduct} />
            ))
          ) : (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#a0a0b0' }}>
              Nenhum produto cadastrado no momento. Acesse o Painel Admin para adicionar!
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
