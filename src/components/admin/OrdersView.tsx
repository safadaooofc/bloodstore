import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, XCircle, Clock, Send, Mail, User, AlertCircle, ShoppingBag } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, approveOrder, rejectOrder } = useStore();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleApprove = async (orderId: string) => {
    setProcessingId(orderId);
    setFeedback(null);
    try {
      const result = await approveOrder(orderId);
      setFeedback({ id: orderId, success: result.success, message: result.message });
    } catch (err) {
      setFeedback({ id: orderId, success: false, message: 'Erro ao aprovar e processar entrega.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (orderId: string) => {
    if (window.confirm(`Tem certeza que deseja cancelar / rejeitar o pedido #${orderId}?`)) {
      rejectOrder(orderId);
      setFeedback({ id: orderId, success: true, message: `Pedido #${orderId} foi marcado como rejeitado/cancelado.` });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="hud-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#ff003c]">
        <div>
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
            <Send className="w-6 h-6 text-[#ff003c]" />
            <span>Vendas & Aprovação de Entrega Automática</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ao aprovar uma compra, o sistema retira automaticamente os itens do estoque do produto, vincula à conta/painel do cliente e dispara a notificação no Webhook do Discord + simulação de E-mail.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-[#ff003c] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'pending' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Aguardando ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'approved' ? 'bg-emerald-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Aprovados ({orders.filter(o => o.status === 'approved').length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
          feedback.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white underline">
            Fechar
          </button>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="hud-card p-12 text-center text-slate-500">
          Nenhum pedido encontrado nesta categoria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPending = order.status === 'pending';
            const isApproved = order.status === 'approved';
            const isRejected = order.status === 'rejected';

            return (
              <div key={order.id} className="hud-card p-6 transition-all hover:border-white/15">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${
                      isPending ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                      isApproved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {isPending && <Clock className="w-6 h-6 animate-pulse" />}
                      {isApproved && <CheckCircle2 className="w-6 h-6" />}
                      {isRejected && <XCircle className="w-6 h-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-white tracking-tight">#{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {isPending && '⏳ AGUARDANDO APROVAÇÃO PIX'}
                          {isApproved && '✅ COMPRA APROVADA & ENTREGUE'}
                          {isRejected && '❌ CANCELADO / REJEITADO'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-white">
                          <User className="w-3.5 h-3.5 text-[#ff003c]" />
                          <strong>{order.buyerDiscordNick}</strong>
                        </span>
                        {order.buyerEmail && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.buyerEmail}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-mono uppercase">Total Pago</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={processingId === order.id}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{processingId === order.id ? 'Aprovando...' : 'Aprovar & Enviar'}</span>
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          disabled={processingId === order.id}
                          className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-colors"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items and Delivery Summary */}
                <div className="mt-4 pt-2 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#ff003c]" />
                    <span>Itens do Pedido</span>
                  </h4>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="font-mono text-slate-400">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {isApproved && item.deliveredItems && (
                          <div className="mt-2 p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg font-mono text-[11px] text-indigo-200 space-y-1">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Itens/Contas Entregues Automaticamente (Acesso do Usuário):</span>
                            </div>
                            {item.deliveredItems.map((delItem, delIdx) => (
                              <div key={delIdx} className="pl-2 border-l-2 border-indigo-500 text-white font-semibold py-0.5">
                                {delItem}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Delivery details */}
                {isApproved && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-semibold">
                        ⚡ Notificação Discord Disparada
                      </span>
                      {order.buyerEmail ? (
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-300 font-semibold">
                          📧 E-mail com produto enviado para {order.buyerEmail}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                          📦 Liberado na Área "Meus Pedidos" do Usuário
                        </span>
                      )}
                    </div>
                    <span className="font-mono">Aprovado em: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('pt-BR') : 'Agora'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
