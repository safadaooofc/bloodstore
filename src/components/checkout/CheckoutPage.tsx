import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { sendDiscordPurchaseNotification } from '../../services/discordWebhook';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ShieldCheck, QrCode, ExternalLink, Check, AlertCircle, Sparkles, ArrowLeft, Copy, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon, applyCoupon, setAppliedCoupon, updateCartQuantity, removeFromCart, clearCart, config, setActiveView, currentUser, createOrder } = useStore();
  
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);
  
  const [discordNick, setDiscordNick] = useState(currentUser ? currentUser.username : '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [isInServer, setIsInServer] = useState(!!currentUser);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'discord'>('pix');
  
  const [pixGenerated, setPixGenerated] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedKeyOnly, setCopiedKeyOnly] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (!discordNick) setDiscordNick(currentUser.username);
      if (!contactEmail && currentUser.email) setContactEmail(currentUser.email);
      setIsInServer(true);
    }
  }, [currentUser]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const total = Math.max(0, subtotal - discountAmount);

  const pixKey = config.pixKey || '14f35f4f-9255-496b-bd0e-2fce7d60af92';
  const pixCopyPasteCode = `00020126580014br.gov.bcb.pix0136${pixKey}5204000053039865405${total.toFixed(2).replace('.', '')}5802BR5915BLOOD STORE OFC6009SAO PAULO62140510PED-${Date.now().toString().slice(-4)}6304E1D2`;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const handleValidateBuyer = (): boolean => {
    if (!discordNick.trim() || discordNick.trim().length < 2) {
      setValidationError('Por favor, digite seu Nickname exato do Discord.');
      return false;
    }
    if (!isInServer) {
      setValidationError('Você precisa confirmar que está no servidor do Discord da Blood Store.');
      return false;
    }
    if (cart.length === 0) {
      setValidationError('Seu carrinho está vazio!');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleStartPix = () => {
    if (!handleValidateBuyer()) return;
    setPixGenerated(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyKeyOnly = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKeyOnly(true);
    setTimeout(() => setCopiedKeyOnly(false), 3000);
  };

  const buildReceiptText = (method: 'PIX AUTOMÁTICO' | 'TICKET DISCORD', orderId: string) => {
    const itemsList = cart.map(item => `• ${item.quantity}x ${item.product.name} (R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')})`).join('\n');
    return `🔴 **PEDIDO BLOOD STORE #${orderId} // NOVO TICKET** 🔴\n` +
      `👤 **Comprador Discord:** \`${discordNick}\`\n` +
      (contactEmail ? `📧 **Contato:** \`${contactEmail}\`\n` : '') +
      `🔑 **Chave PIX:** \`${pixKey}\`\n` +
      `🛒 **Itens Adquiridos:**\n${itemsList}\n` +
      (appliedCoupon ? `🎟️ **Cupom Aplicado:** \`${appliedCoupon.code}\` (-R$ ${discountAmount.toFixed(2).replace('.', ',')})\n` : '') +
      `💰 **TOTAL DO PEDIDO:** **R$ ${total.toFixed(2).replace('.', ',')}**\n` +
      `💳 **Método de Pagamento:** ${method}\n` +
      `⚡ *Aguardando liberação de estoque pelo painel!*`;
  };

  const handleFinishAndOpenDiscord = async (methodTitle: 'PIX AUTOMÁTICO' | 'TICKET DISCORD') => {
    if (!handleValidateBuyer()) return;

    const newOrder = createOrder({
      buyerDiscordNick: discordNick.trim(),
      buyerEmail: contactEmail.trim() || undefined,
      buyerAvatarUrl: currentUser?.avatarUrl,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal,
      discountAmount,
      total,
      couponCode: appliedCoupon?.code,
      paymentMethod: methodTitle,
      pixKeyUsed: pixKey
    });

    const receipt = buildReceiptText(methodTitle, newOrder.id);
    navigator.clipboard.writeText(receipt);

    await sendDiscordPurchaseNotification({
      storeName: config.storeName,
      discordNick: discordNick.trim(),
      contactEmail: contactEmail.trim() || undefined,
      cart,
      appliedCoupon,
      subtotal,
      discountAmount,
      total,
      paymentMethod: methodTitle,
      webhookUrl: config.discordWebhookUrl,
      orderId: newOrder.id,
      pixKey: pixKey
    });

    setOrderCompleted(true);
    clearCart();

    setTimeout(() => {
      window.open(config.globalDiscordUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  if (cart.length === 0 && !orderCompleted) {
    return (
      <section className="container-main py-12 text-center animate-fadeIn">
        <div className="hud-card max-w-md mx-auto p-8 flex flex-col items-center gap-4 border-[#ff003c]/40">
          <div className="p-4 bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-2xl text-[#ff003c]">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">
            Seu carrinho está vazio
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Você ainda não adicionou nenhum produto da {config.storeName}. Explore nosso catálogo para selecionar pacotes e serviços.
          </p>
          <button 
            onClick={() => setActiveView('home')}
            className="btn-cyber mt-2 py-2 px-5 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Loja</span>
          </button>
        </div>
      </section>
    );
  }

  if (orderCompleted) {
    return (
      <section className="container-main py-12 text-center animate-fadeIn">
        <div className="hud-card max-w-xl mx-auto p-8 border-emerald-500/40 flex flex-col items-center gap-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest">
            • Transação registrada com sucesso
          </div>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Pedido liberado para entrega!
          </h2>
          <div className="bg-slate-900/80 border border-white/10 p-4 w-full text-left rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Copy className="w-4 h-4" />
              <span>O comprovante foi copiado para sua área de transferência!</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Enviamos a notificação ao sistema corporativo e abrimos o portal de suporte em uma nova aba. Acesse o nosso canal oficial de atendimento, inicie o chamado e **cole (`Ctrl+V`)** o comprovante para liberação dos seus itens.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center w-full pt-1">
            <a 
              href={config.globalDiscordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber py-2.5 px-5 text-xs"
            >
              <span>Acessar Central de Suporte</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button 
              onClick={() => { setOrderCompleted(false); setActiveView('home'); }}
              className="btn-cyber-outline py-2.5 px-5 text-xs"
            >
              <span>Retornar ao Catálogo</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-main py-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="mb-6 border-b border-white/10 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ff003c] uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>• Finalização Rápida</span>
          </div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Checkout & <span className="text-[#ff003c]">Pagamento</span>
          </h1>
        </div>

        <button 
          onClick={() => setActiveView('home')}
          className="btn-cyber-outline text-xs py-1.5 px-3.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar à Loja</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {validationError && (
        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Grid: Compact 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols width on desktop): Cart Items & Buyer Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Box 1: Items List */}
          <div className="hud-card p-4 sm:p-5 border-[#ff003c]/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h2 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#ff003c]" />
                <span>Itens Selecionados ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </h2>
              <button 
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-white font-semibold flex items-center gap-1.5 bg-[#121218] hover:bg-red-600 border border-white/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Esvaziar</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {cart.map(item => (
                <div key={item.product.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#16141e]/80 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-8 h-8 object-cover rounded-md border border-slate-700 flex-shrink-0"
                    />
                    <div>
                      <div className="text-[9px] font-bold text-[#ff003c] uppercase tracking-wider">
                        • {item.product.tag}
                      </div>
                      <div className="font-bold text-white text-xs font-display">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Unitário: R$ {item.product.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-[#1e1b29] border border-white/10 rounded-lg p-0.5 gap-1">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[#121218] hover:bg-[#ff003c] border border-white/10 text-white rounded transition-colors"
                        title="Diminuir quantidade"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-[#121218] hover:bg-[#ff003c] border border-white/10 text-white rounded transition-colors"
                        title="Aumentar quantidade"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right min-w-[75px]">
                      <div className="font-extrabold text-white text-xs">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-7 h-7 flex items-center justify-center bg-[#121218] hover:bg-red-600 border border-white/10 text-slate-300 hover:text-white rounded-md transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Coupon */}
          <div className="hud-card p-4 sm:p-5">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#ff003c]" />
              <span>Cupom de Desconto</span>
            </h3>

            <form onSubmit={handleApplyCoupon} className="flex flex-wrap gap-2.5 items-center">
              <input 
                type="text"
                placeholder="Digite o cupom (ex: BLOOD10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{ backgroundColor: '#141622', color: '#ffffff' }}
                className="flex-1 min-w-[180px] px-4 py-2.5 bg-[#141622] border border-white/12 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-[#ff003c] uppercase placeholder:text-slate-500 transition-colors"
              />
              <button 
                type="submit"
                className="btn-cyber py-2.5 px-5 text-xs"
              >
                <span>Aplicar</span>
              </button>
            </form>

            {couponMessage && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                couponMessage.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <span>{couponMessage.text}</span>
                {couponMessage.success && appliedCoupon && (
                  <button 
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponMessage(null); setCouponInput(''); }}
                    className="underline font-semibold hover:opacity-80 ml-2"
                  >
                    Remover
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Box 3: Buyer Nickname & Verification */}
          <div className="hud-card p-4 sm:p-5 border-t border-[#ff003c]/40">
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#ff003c]" />
              <span>Dados de Entrega (Discord)</span>
            </h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              Preencha seu Nickname correto do Discord para liberação automática do produto no estoque.
            </p>

            {currentUser && (
              <div className="p-3 bg-[#16141e] border border-[#ff003c]/40 rounded-xl flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full border border-[#ff003c]" />
                  <div>
                    <div className="text-xs font-bold text-white">Conectado como {currentUser.globalName}</div>
                    <div className="text-[10px] text-[#ff003c] font-mono">@{currentUser.username} • Verificado</div>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-[#ff003c]" />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu Nickname do Discord (Obrigatório) *
                </label>
                <input 
                  type="text"
                  placeholder="Ex: lucas.gamer ou Lucas#1234"
                  value={discordNick}
                  onChange={(e) => setDiscordNick(e.target.value)}
                  style={{ backgroundColor: '#141622', color: '#ffffff' }}
                  className="w-full px-4 py-2.5 bg-[#141622] border border-white/12 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-[#ff003c] placeholder:text-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail de Contato / Recibo (Opcional)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: seuemail@gmail.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{ backgroundColor: '#141622', color: '#ffffff' }}
                  className="w-full px-4 py-2.5 bg-[#141622] border border-white/12 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-[#ff003c] placeholder:text-slate-500 transition-colors"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input 
                  type="checkbox"
                  checked={isInServer}
                  onChange={(e) => setIsInServer(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-[#ff003c] mt-0.5"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Confirmo que estou no servidor oficial <strong className="text-white">{config.storeName}</strong> no Discord e que meu nickname está correto.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (1 col width on desktop): Summary & Payment Selection */}
        <div className="space-y-5 sticky top-20">
          {/* Box 4: Financial Summary */}
          <div className="hud-card p-4 sm:p-5 border-[#ff003c]/40">
            <h3 className="text-sm font-bold font-display text-white border-b border-white/10 pb-3 mb-3">
              Resumo Financeiro
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal dos Itens:</span>
                <span className="font-semibold text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Desconto ({appliedCoupon.code}):</span>
                  <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Taxa de Ticket:</span>
                <span className="text-emerald-400 font-semibold">Grátis</span>
              </div>

              <div className="border-t border-white/10 pt-3 mt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase">Total a Pagar:</span>
                <span className="text-xl font-extrabold text-[#ff003c]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Box 5: Choose Payment Method */}
          <div className="hud-card p-4 sm:p-5">
            <h3 className="text-sm font-bold font-display text-white mb-3">
              Forma de Pagamento
            </h3>

            <div className="space-y-2.5">
              {/* Option A: PIX Automático */}
              <div 
                onClick={() => { setPaymentMethod('pix'); setPixGenerated(false); }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  paymentMethod === 'pix' 
                    ? 'bg-[#ff003c]/10 border-[#ff003c] shadow-md shadow-[#ff003c]/15' 
                    : 'bg-[#16141e]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <QrCode className="w-4 h-4 text-[#ff003c]" />
                    <span>PIX Instantâneo (Copia & Cola / QR)</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded">
                    Ágil
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Gere o código PIX e pague via aplicativo do seu banco com liberação automática.
                </p>
              </div>

              {/* Option B: Ticket no Discord */}
              <div 
                onClick={() => { setPaymentMethod('discord'); setPixGenerated(false); }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                  paymentMethod === 'discord' 
                    ? 'bg-[#ff003c]/10 border-[#ff003c] shadow-md shadow-[#ff003c]/15' 
                    : 'bg-[#16141e]/70 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <ExternalLink className="w-4 h-4 text-[#ff003c]" />
                    <span>Pagar via Ticket / Atendimento</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-white/10 text-[9px] font-bold rounded">
                    Manual
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Copie o resumo formatado e abra ticket com nossa equipe no servidor.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              {paymentMethod === 'pix' && !pixGenerated && (
                <button 
                  onClick={handleStartPix}
                  className="btn-cyber w-full py-3 text-xs animate-pulse-glow"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar QR Code PIX Agora</span>
                </button>
              )}

              {paymentMethod === 'discord' && (
                <button 
                  onClick={() => handleFinishAndOpenDiscord('TICKET DISCORD')}
                  className="w-full py-3 px-4 bg-[#ff003c] hover:bg-[#d90033] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#ff003c]/25 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Ticket com o Recibo</span>
                </button>
              )}
            </div>
          </div>

          {/* Box 6: Simulated PIX Terminal (Appears when PIX is generated) */}
          {paymentMethod === 'pix' && pixGenerated && (
            <div className="hud-card p-4 sm:p-5 border-2 border-emerald-500 animate-fadeIn shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-3 border-b border-emerald-500/20 pb-2.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>QR Code PIX Gerado • Chave Oficial</span>
              </div>

              {/* Compact QR Code Graphic */}
              <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center mb-3.5 border-2 border-emerald-500">
                <div className="w-32 h-32 bg-black p-1.5 flex items-center justify-center relative rounded-lg overflow-hidden">
                  <img 
                    src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi.png" 
                    alt="QR Code" 
                    className="w-full h-full object-cover filter contrast-200"
                  />
                  <div className="absolute inset-4 bg-[#ff003c] rounded-lg flex items-center justify-center text-white font-bold text-[10px] text-center shadow-2xl p-1">
                    PIX Oficial<br />R$ {total.toFixed(2)}
                  </div>
                </div>
                <span className="mt-1.5 text-[10px] font-extrabold text-slate-900 tracking-wider">
                  ESCANEIE COM O APP BANCÁRIO
                </span>
              </div>

              {/* PIX Key and Copia e Cola field */}
              <div className="space-y-2.5 mb-4 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🔑 Chave PIX Oficial:
                  </label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixKey} 
                      className="flex-1 px-2.5 py-2 bg-[#16141e] border border-[#ff003c]/60 rounded-lg text-white font-mono text-xs font-bold focus:outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyKeyOnly}
                      className="px-3 py-2 bg-[#ff003c] hover:bg-[#d90033] text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedKeyOnly ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKeyOnly ? 'Copiada!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    📋 Código Copia & Cola:
                  </label>
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixCopyPasteCode} 
                      className="flex-1 px-2.5 py-2 bg-[#16141e] border border-emerald-500/50 rounded-lg text-emerald-400 font-mono text-[11px] focus:outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyPix}
                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm action */}
              <button 
                onClick={() => handleFinishAndOpenDiscord('PIX AUTOMÁTICO')}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Notificar no Discord!</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
