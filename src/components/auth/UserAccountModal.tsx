import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Package, CheckCircle2, Clock, Copy, Check, ShieldCheck, ShoppingBag, LogOut } from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logoutDiscord, orders } = useStore();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const myOrders = orders.filter(
    o =>
      o.buyerDiscordNick.toLowerCase() === currentUser.username.toLowerCase() ||
      (currentUser.email && o.buyerEmail?.toLowerCase() === currentUser.email.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#1e293b]/80 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="w-11 h-11 rounded-full border-2 border-[#ff003c] object-cover bg-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{currentUser.globalName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ff003c]/20 border border-[#ff003c]/40 text-[#ff003c] text-[10px] font-bold font-mono uppercase">
                  CONTA DISCORD VERIFICADA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                @{currentUser.username} {currentUser.email ? `• ${currentUser.email}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logoutDiscord();
                onClose();
              }}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desconectar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-3">
            <Package className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-100 leading-relaxed">
              <strong>Painel de Meus Produtos e Entregas:</strong> Assim que sua compra for aprovada pela equipe da Blood Store no Discord ou PIX, seus produtos (logins, senhas, chaves de ativação) serão liberados no estoque e exibidos automaticamente abaixo para você copiar.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Histórico de Pedidos (@{currentUser.username})</span>
              <span className="font-mono text-slate-400">{myOrders.length} pedido(s) encontrado(s)</span>
            </h4>

            {myOrders.length === 0 ? (
              <div className="p-10 bg-slate-900/60 border border-white/5 rounded-2xl text-center flex flex-col items-center gap-3">
                <ShoppingBag className="w-10 h-10 text-slate-600" />
                <p className="text-sm text-slate-400 font-medium">
                  Você ainda não realizou nenhum pedido com a conta <strong className="text-white">@{currentUser.username}</strong>.
                </p>
                <p className="text-xs text-slate-500 max-w-md">
                  Ao fechar um pedido no carrinho usando seu nickname exato do Discord, ele aparecerá aqui com status em tempo real e entrega instantânea de itens.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => {
                  const isPending = order.status === 'pending';
                  const isApproved = order.status === 'approved';
                  const isRejected = order.status === 'rejected';

                  return (
                    <div
                      key={order.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isApproved
                          ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                          : isPending
                          ? 'bg-slate-900/70 border-amber-500/30'
                          : 'bg-slate-900/50 border-red-500/20 opacity-75'
                      }`}
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-white tracking-tight">Pedido #{order.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isApproved
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}
                          >
                            {isPending && '⏳ EM ANÁLISE / AGUARDANDO LIBERAÇÃO'}
                            {isApproved && '✅ APROVADO & ESTOQUE LIBERADO'}
                            {isRejected && '❌ PEDIDO CANCELADO'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className="font-bold text-white">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs space-y-2">
                            <div className="flex items-center justify-between font-semibold text-white">
                              <span>{item.quantity}x {item.productName}</span>
                              <span className="text-slate-400 font-mono">
                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            {/* Delivered Items Area (Full Access) */}
                            {isApproved && item.deliveredItems && item.deliveredItems.length > 0 && (
                              <div className="mt-2.5 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
                                <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Itens Entregues (Seu Acesso Completo):</span>
                                </div>

                                <div className="space-y-1.5">
                                  {item.deliveredItems.map((delItem, delIdx) => {
                                    const copyId = `${order.id}-${idx}-${delIdx}`;
                                    const isCopied = copiedText === copyId;

                                    return (
                                      <div
                                        key={delIdx}
                                        className="p-2.5 bg-slate-900 border border-emerald-500/20 rounded-lg flex items-center justify-between gap-2 text-white font-mono text-xs"
                                      >
                                        <span className="truncate flex-1 select-all">{delItem}</span>
                                        <button
                                          onClick={() => handleCopy(delItem, copyId)}
                                          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
                                        >
                                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                          <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {isPending && (
                              <div className="mt-1 text-[11px] text-amber-300/80 flex items-center gap-1.5 font-mono">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>Aguardando aprovação do PIX no painel/ticket para liberar seu produto...</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#1e293b]/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ff003c]" />
            <span>Sistema seguro de entrega automática Blood Store</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
