import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ onSelectProduct }) => {
  const { products, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  const activeCategories = categories && categories.length > 0 
    ? categories 
    : [
        { id: "cat_contas", name: "Contas & Perfis", icon: "fa-solid fa-user-shield" },
        { id: "cat_moedas", name: "Moedas & Gold", icon: "fa-solid fa-coins" },
        { id: "cat_itens", name: "Itens & Godlys", icon: "fa-solid fa-wand-magic-sparkles" },
        { id: "cat_servicos", name: "Serviços & Nitro", icon: "fa-brands fa-discord" },
        { id: "cat_geral", name: "Outros / Diversos", icon: "fa-solid fa-box" }
      ];

  const matchesCategory = (prod, targetCategoryKey) => {
    if (targetCategoryKey === 'all') return true;
    const targetCatObj = activeCategories.find(c => c.name === targetCategoryKey || c.id === targetCategoryKey);
    const targetName = targetCatObj ? targetCatObj.name : targetCategoryKey;
    const targetId = targetCatObj ? targetCatObj.id : targetCategoryKey;

    if (!prod.category || prod.category === 'cat_geral' || prod.category === 'Outros / Diversos') {
      return targetName === 'Outros / Diversos' || targetId === 'cat_geral';
    }

    return prod.category === targetName || prod.category === targetId;
  };

  const filterAndSort = (prodList = []) => {
    let filtered = prodList.filter(p => {
      const matchSearch = searchTerm.trim() === '' || 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(p.benefits) && p.benefits.some(b => b?.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchCat = matchesCategory(p, selectedCategory);
      return matchSearch && matchCat;
    });

    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
    } else if (sortOrder === 'name-asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'name-desc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    return filtered;
  };

  const allFiltered = filterAndSort(products || []);

  return (
    <section id="catalogo" className="section-products">
      <div className="container">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2>Catálogo de Produtos</h2>
          <p>Selecione o item desejado para iniciar seu atendimento ou pesquise abaixo.</p>
        </div>

        {/* Barra de Busca e Ordenação Simples, Limpa e Direta ("Menos IA") */}
        <div className="catalog-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div className="catalog-search-wrapper" style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center', background: '#13131c', border: '1px solid #2a2a38', borderRadius: '8px', padding: '0 14px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#a0a0b0', marginRight: '10px' }}></i>
            <input 
              type="text" 
              placeholder="Pesquisar por nome do produto, jogo ou benefício..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="catalog-search-input"
              style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 0', width: '100%', outline: 'none', fontSize: '0.95rem' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="catalog-search-clear" title="Limpar busca" style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '4px' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="catalog-sort-wrapper" style={{ minWidth: '220px' }}>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="catalog-sort-select"
              style={{ width: '100%', height: '100%', background: '#13131c', border: '1px solid #2a2a38', borderRadius: '8px', color: '#fff', padding: '12px 14px', outline: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <option value="default">⚡ Ordem Padrão</option>
              <option value="price-asc">💰 Menor Preço Primeiro</option>
              <option value="price-desc">💎 Maior Preço Primeiro</option>
              <option value="name-asc">🔤 Nome (A a Z)</option>
              <option value="name-desc">🔠 Nome (Z a A)</option>
            </select>
          </div>
        </div>

        {/* Pills / Abas de Filtro por Categorias (Sempre Visíveis!) */}
        <div className="catalog-category-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button 
            className={`cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <i className="fa-solid fa-layer-group"></i> Todas as Categorias ({products?.length || 0})
          </button>
          {activeCategories.map((cat) => {
            const count = (products || []).filter(p => matchesCategory(p, cat.name)).length;
            return (
              <button 
                key={cat.id || cat.name}
                className={`cat-pill ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <i className={cat.icon || "fa-solid fa-tag"}></i> {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Exibição em Cascata (Categorias SEMPRE uma embaixo da outra) quando "Todas" selecionado */}
        {selectedCategory === 'all' ? (
          <div>
            {allFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#151520', borderRadius: '12px', border: '1px dashed #331515' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', color: '#78788c', marginBottom: '16px' }}></i>
                <p style={{ color: '#a0a0b0', fontSize: '1.1rem' }}>Nenhum produto encontrado para a sua pesquisa.</p>
              </div>
            ) : (
              activeCategories.map((cat) => {
                const catProducts = allFiltered.filter(p => matchesCategory(p, cat.name));

                return (
                  <div key={cat.id || cat.name} className="category-section" style={{ marginBottom: '40px' }}>
                    <div className="category-section-header">
                      <div className="category-section-title-box">
                        <span className="category-section-title">
                          <i className={cat.icon || "fa-solid fa-tag"}></i> {cat.name}
                        </span>
                        <span className="category-count-badge">{catProducts.length} {catProducts.length === 1 ? 'item' : 'itens'}</span>
                      </div>
                    </div>

                    {catProducts.length > 0 ? (
                      <div className="products-grid">
                        {catProducts.map((prod) => (
                          <ProductCard key={prod.id} product={prod} onSelectProduct={onSelectProduct} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '24px', background: '#12121a', borderRadius: '8px', border: '1px solid #1f1f2e', color: '#78788c', fontSize: '0.9rem' }}>
                        <i className="fa-solid fa-circle-info" style={{ marginRight: '8px', color: '#ffc107' }}></i>
                        Nenhum produto cadastrado nesta categoria no momento.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Exibição de uma categoria específica selecionada */
          <div>
            {(() => {
              const selectedCatObj = activeCategories.find(c => c.name === selectedCategory || c.id === selectedCategory);
              const headerTitle = selectedCatObj ? selectedCatObj.name : selectedCategory;
              const headerIcon = selectedCatObj ? selectedCatObj.icon : "fa-solid fa-tag";

              return (
                <div className="category-section" style={{ marginBottom: '40px' }}>
                  <div className="category-section-header">
                    <div className="category-section-title-box">
                      <span className="category-section-title">
                        <i className={headerIcon}></i> {headerTitle}
                      </span>
                      <span className="category-count-badge">{allFiltered.length} {allFiltered.length === 1 ? 'item' : 'itens'}</span>
                    </div>
                  </div>

                  {allFiltered.length > 0 ? (
                    <div className="products-grid">
                      {allFiltered.map((prod) => (
                        <ProductCard key={prod.id} product={prod} onSelectProduct={onSelectProduct} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#151520', borderRadius: '12px', border: '1px dashed #331515' }}>
                      <i className="fa-solid fa-box-open" style={{ fontSize: '2.5rem', color: '#78788c', marginBottom: '16px' }}></i>
                      <p style={{ color: '#a0a0b0', fontSize: '1.1rem' }}>Nenhum produto disponível nesta categoria com os filtros atuais.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </section>
  );
};

