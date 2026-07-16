import React from 'react';
import { useStore } from '../../context/StoreContext';
import { OverviewView } from './OverviewView';
import { ProductsView } from './ProductsView';
import { StockView } from './StockView';
import { OrdersView } from './OrdersView';
import { TermsView } from './TermsView';
import { SettingsView } from './SettingsView';
import { SecurityView } from './SecurityView';
import { Terminal, ShoppingBag, ShieldCheck, Settings, LogOut, Activity, ExternalLink, ShieldAlert, Package, Send } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminTab, setAdminTab, logoutAdmin, setActiveView, orders, products } = useStore();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalStockCount = products.reduce((acc, p) => acc + (p.stockItems?.length || 0), 0);

  return (
    <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto relative z-10 min-h-screen">
      {/* Top Admin Header Bar */}
      <div className="hud-card p-5 sm:p-6 mb-8 border-l-4 border-l-[#4f46e5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46e5]/10 border border-[#4f46e5]/30 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-[#4f46e5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold font-display text-white tracking-tight">
                Painel Administrativo <span className="text-[#4f46e5]">Blood Store</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ADMIN LOGADO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesso irrestrito ao estoque, aprovação automática de pedidos, produtos e configurações.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setActiveView('home')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <span>Ir para a Loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logoutAdmin}
            className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 mb-8 pb-2 gap-2 sm:gap-3 select-none no-scrollbar">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'overview'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap relative ${
            adminTab === 'orders'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Vendas & Aprovação</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px]">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('stock')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'stock'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Estoque Automatico</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-mono text-[10px]">
            {totalStockCount}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('products')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'products'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catálogo</span>
        </button>

        <button
          onClick={() => setAdminTab('terms')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'terms'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Regras e Termos</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'settings'
              ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </button>

        <button
          onClick={() => setAdminTab('security')}
          className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 rounded-xl whitespace-nowrap ${
            adminTab === 'security'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'text-red-400 hover:text-red-300 hover:bg-red-950/20'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Auditoria</span>
        </button>
      </div>

      {/* Tab Content Render */}
      <div className="pb-12">
        {adminTab === 'overview' && <OverviewView />}
        {adminTab === 'orders' && <OrdersView />}
        {adminTab === 'stock' && <StockView />}
        {adminTab === 'products' && <ProductsView />}
        {adminTab === 'terms' && <TermsView />}
        {adminTab === 'settings' && <SettingsView />}
        {adminTab === 'security' && <SecurityView />}
      </div>
    </section>
  );
};
