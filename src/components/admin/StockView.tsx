import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../types/store';
import { Package, Save, Trash2, CheckCircle2, Layers } from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, updateProductStock } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [stockText, setStockText] = useState<string>(() => {
    return products[0]?.stockItems?.join('\n') || '';
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setStockText(product.stockItems?.join('\n') || '');
    setSaveMessage(null);
  };

  const handleSaveStock = () => {
    if (!selectedProduct) return;
    const lines = stockText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    updateProductStock(selectedProduct.id, lines);
    setSaveMessage(`✅ Estoque atualizado com sucesso! (${lines.length} unidades disponíveis)`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header banner */}
      <div className="hud-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#ff003c]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ff003c]/20 border border-[#ff003c]/30 rounded-xl text-[#ff003c]">
            <Package className="w-6 h-6 text-[#ff003c]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Estoque & Entrega Automática</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Insira o formato: <code className="text-white bg-slate-800 px-1 py-0.5 rounded">Login: xxx | Senha: yyy</code>. Cada linha preenchida vira <strong className="text-white">1 unidade em estoque</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl text-xs font-semibold text-[#ff003c]">
          <Layers className="w-4 h-4" />
          <span>Controle Dinâmico de Linhas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product List */}
        <div className="hud-card p-5 lg:col-span-1 space-y-3 max-h-[650px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
            Selecione o Produto
          </h3>
          <div className="space-y-2">
            {products.map(product => {
              const stockCount = product.stockItems?.length || 0;
              const isSelected = selectedProduct?.id === product.id;

              return (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-[#ff003c]/15 border-[#ff003c] text-white shadow-md'
                      : 'bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-900 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-800"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold truncate text-white">{product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Tag: {product.tag}</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        stockCount > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {stockCount > 0 ? `${stockCount} UNID.` : 'ESGOTADO'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stock Editor */}
        <div className="hud-card p-6 lg:col-span-2 space-y-5">
          {selectedProduct ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-white/10"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedProduct.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#ff003c] font-semibold font-mono">
                        R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Disponíveis atualmente: <strong className="text-white">{selectedProduct.stockItems?.length || 0}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveStock}
                  className="px-5 py-2.5 bg-[#ff003c] hover:bg-[#d90033] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff003c]/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Linhas de Estoque</span>
                </button>
              </div>

              {saveMessage && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff003c]" />
                  <span>Editor Linha por Linha:</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Digite cada item em uma nova linha. Exemplo: <br />
                  <code className="text-[#ff003c] font-mono text-[11px]">
                    Login: user_01 | Senha: pass123 | E-mail: email@test.com
                  </code><br />
                  Quando o pedido for aprovado, o sistema pegará automaticamente a primeira linha, enviará para o cliente e removerá esta linha do estoque.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Linhas de Estoque ({stockText.split('\n').filter(l => l.trim()).length} linha(s))
                </label>
                <textarea
                  rows={10}
                  placeholder="Login: exemplo@blood.gg | Senha: abc123&#10;Login: compra02@blood.gg | Senha: def456&#10;Chave: XXXX-YYYY-ZZZZ"
                  value={stockText}
                  onChange={(e) => setStockText(e.target.value)}
                  className="w-full p-4 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#ff003c] transition-colors resize-y"
                />
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Deseja esvaziar todo o estoque deste produto?
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`Limpar todo o estoque de ${selectedProduct.name}?`)) {
                      setStockText('');
                      updateProductStock(selectedProduct.id, []);
                      setSaveMessage('Estoque esvaziado.');
                    }
                  }}
                  className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Estoque</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500">
              Selecione um produto à esquerda para gerenciar o estoque.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
