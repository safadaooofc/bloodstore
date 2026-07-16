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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

    // Register order in store context (for admin approval and user account dashboard)
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

    // Send Discord Webhook notification automatically!
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
      <section className="container-main py-16 text-center animate-fadeIn">
        <div className="hud-card max-w-xl mx-auto p-10 flex flex-col items-center gap-5">
          <div className="p-5 bg-slate-800/80 border border-white/10 rounded-2xl text-[#4f46e5]">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Seu carrinho está vazio
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Você ainda não adicionou nenhum produto da {config.storeName}. Explore nosso catálogo para selecionar pacotes e serviços de excelência.
          </p>
          <button 
            onClick={() => setActiveView('home')}
            className="btn-cyber mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Loja</span>
          </button>
        </div>
      </section>
    );
  }

  if (orderCompleted) {
    return (
      <section className="container-main py-16 text-center animate-fadeIn">
        <div className="hud-card max-w-2xl mx-auto p-10 border-emerald-500/40 flex flex-col items-center gap-6">
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            • Pedido registrado e notificado
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Pedido pronto para entrega!
          </h2>
          <div className="bg-slate-900/80 border border-white/10 p-5 w-full text-left rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Copy className="w-4 h-4" />
              <span>O recibo foi copiado para sua área de transferência!</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Enviamos a notificação de venda diretamente ao Discord oficial e estamos abrindo o servidor em nova aba. Basta ir no canal de **pedidos / tickets**, abrir seu ticket e **colar (`Ctrl+V`)** o recibo para receber seus itens imediatamente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center w-full pt-2">
            <a 
              href={config.globalDiscordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber py-3 px-6 text-sm"
            >
              <span>Ir ao Servidor Discord Agora</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={() => { setOrderCompleted(false); setActiveView('home'); }}
              className="btn-cyber-outline py-3 px-6 text-sm"
            >
              <span>Continuar Explorando</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-main py-12 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4f46e5] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>• Finalização do Pedido</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            Checkout & <span className="text-[#4f46e5]">Pagamento</span>
          </h1>
        </div>

        <button 
          onClick={() => setActiveView('home')}
          className="btn-cyber-outline text-xs py-2 px-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {validationError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Grid: Left Items + Form, Right Summary & Pay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols width on desktop): Cart Items & Buyer Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Items List */}
          <div className="hud-card p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#4f46e5]" />
                <span>Itens Selecionados ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </h2>
              <button 
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Esvaziar</span>
              </button>
            </div>

            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3.5 flex-1 min-w-[220px]">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider">
                        • {item.product.tag}
                      </div>
                      <div className="font-bold text-white text-sm font-display">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Unitário: R$ {item.product.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-slate-800 border border-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
                        title="Diminuir quantidade"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white/10 text-white rounded transition-colors"
                        title="Aumentar quantidade"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right min-w-[85px]">
                      <div className="font-extrabold text-white text-sm">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Coupon & Referral Code Input */}
          <div className="hud-card p-6">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-[#3b82f6]" />
              <span>Cupom de Desconto ou Indicação</span>
            </h3>

            <form onSubmit={handleApplyCoupon} className="flex flex-wrap gap-3 items-center">
              <input 
                type="text"
                placeholder="Digite o código promocional (ex: BLOOD10, VIP20)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-[#4f46e5] uppercase transition-colors"
              />
              <button 
                type="submit"
                className="btn-cyber py-2.5 px-5 text-xs"
              >
                <span>Aplicar</span>
              </button>
            </form>

            {couponMessage && (
              <div className={`mt-3.5 p-3 rounded-xl text-xs flex items-center justify-between border ${
                couponMessage.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <span>{couponMessage.text}</span>
                {couponMessage.success && appliedCoupon && (
                  <button 
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponMessage(null); setCouponInput(''); }}
                    className="underline font-semibold hover:opacity-80"
                  >
                    Remover
                  </button>
                )}
              </div>
            )}

            <div className="mt-3 text-xs text-slate-400">
              💡 Cupons ativos para você: <span className="text-white font-bold">BLOOD10</span> (10% OFF), <span className="text-white font-bold">VIP20</span> (20% OFF), <span className="text-white font-bold">KIOVER</span> (15% OFF)
            </div>
          </div>

          {/* Box 3: Buyer Nickname & Verification */}
          <div className="hud-card p-6 border-t border-[#4f46e5]/40">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4f46e5]" />
              <span>Dados de Entrega & Identificação Discord</span>
            </h3>
            <p className="text-slate-400 text-xs mb-5 leading-relaxed">
              Para liberação ágil e segura em nosso sistema automatizado de tickets, certifique-se de preencher o seu Nickname correto ou estar conectado via conta Discord.
            </p>

            {currentUser && (
              <div className="p-3.5 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-600" />
                  <div>
                    <div className="text-xs font-bold text-white">Conectado como {currentUser.globalName}</div>
                    <div className="text-[11px] text-[#5865F2] font-mono">@{currentUser.username} • Verificado automaticamente</div>
                  </div>
                </div>
                <UserCheck className="w-5 h-5 text-[#5865F2]" />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu Nickname do Discord (Obrigatório) *
                </label>
                <input 
                  type="text"
                  placeholder="Ex: guerreiro.gamer ou Guerreiro#1234"
                  value={discordNick}
                  onChange={(e) => setDiscordNick(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-[#4f46e5] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail para Receber Recibo (Opcional)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: seuemail@gmail.com ou WhatsApp"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-[#4f46e5] transition-colors"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input 
                  type="checkbox"
                  checked={isInServer}
                  onChange={(e) => setIsInServer(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#4f46e5] mt-0.5"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  Confirmo que estou no servidor oficial <strong className="text-white">{config.storeName}</strong> no Discord e que meu nickname está devidamente preenchido para liberação do pedido.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (1 col width on desktop): Summary & Payment Selection */}
        <div className="space-y-6 sticky top-24">
          {/* Box 4: Financial Summary */}
          <div className="hud-card p-6">
            <h3 className="text-base font-bold font-display text-white border-b border-white/10 pb-3.5 mb-4">
              Resumo Financeiro
            </h3>

            <div className="space-y-3 text-sm">
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
                <span>Taxa de Atendimento / Ticket:</span>
                <span className="text-emerald-400 font-semibold">Grátis (R$ 0,00)</span>
              </div>

              <div className="border-t border-white/10 pt-4 mt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase">Total a Pagar:</span>
                <span className="text-2xl font-extrabold text-[#4f46e5]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Box 5: Choose Payment Method */}
          <div className="hud-card p-6">
            <h3 className="text-base font-bold font-display text-white mb-4">
              Escolha o Método de Pagamento
            </h3>

            <div className="space-y-3">
              {/* Option A: PIX Automático */}
              <div 
                onClick={() => { setPaymentMethod('pix'); setPixGenerated(false); }}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  paymentMethod === 'pix' 
                    ? 'bg-[#4f46e5]/10 border-[#4f46e5] shadow-md shadow-[#4f46e5]/10' 
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 font-bold text-white text-sm">
                    <QrCode className="w-4 h-4 text-[#4f46e5]" />
                    <span>PIX Instantâneo (Automático)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gere o QR Code e pague via aplicativo bancário. Liberação e notificação automática na hora!
                </p>
              </div>

              {/* Option B: Ticket no Discord */}
              <div 
                onClick={() => { setPaymentMethod('discord'); setPixGenerated(false); }}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  paymentMethod === 'discord' 
                    ? 'bg-[#3b82f6]/10 border-[#3b82f6] shadow-md shadow-[#3b82f6]/10' 
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5 font-bold text-white text-sm">
                    <ExternalLink className="w-4 h-4 text-[#3b82f6]" />
                    <span>Pagar com Atendente no Discord</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-bold rounded-md">
                    Manual
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Copie o resumo formatado do pedido com cupom e cole direto no ticket de atendimento no servidor.
                </p>
              </div>
            </div>

            {/* Action Buttons based on Payment Method */}
            <div className="mt-6">
              {paymentMethod === 'pix' && !pixGenerated && (
                <button 
                  onClick={handleStartPix}
                  className="btn-cyber w-full py-3.5 text-xs animate-pulse-glow"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar QR Code PIX Agora</span>
                </button>
              )}

              {paymentMethod === 'discord' && (
                <button 
                  onClick={() => handleFinishAndOpenDiscord('TICKET DISCORD')}
                  className="w-full py-3.5 px-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#3b82f6]/25 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Ticket com o Recibo</span>
                </button>
              )}
            </div>
          </div>

          {/* Box 6: Simulated PIX Terminal (Appears when PIX is generated) */}
          {paymentMethod === 'pix' && pixGenerated && (
            <div className="hud-card p-6 border-2 border-emerald-500 animate-fadeIn shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-4 border-b border-emerald-500/20 pb-3">
                <Clock className="w-4 h-4 animate-spin" />
                <span>QR Code PIX Gerado • Válido por 15 min</span>
              </div>

              {/* Simulated QR Code Graphic */}
              <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center mb-5 border-4 border-emerald-500">
                <div className="w-44 h-44 bg-black p-2.5 flex items-center justify-center relative rounded-xl overflow-hidden">
                  <img 
                    src="/fotos/Gemini_Generated_Image_v1yi2kv1yi2kv1yi.png" 
                    alt="QR Code" 
                    className="w-full h-full object-cover filter contrast-200"
                  />
                  <div className="absolute inset-8 bg-[#4f46e5] rounded-xl flex items-center justify-center text-white font-bold text-xs text-center shadow-2xl p-2">
                    PIX Oficial<br />R$ {total.toFixed(2)}
                  </div>
                </div>
                <span className="mt-2 text-xs font-extrabold text-slate-900 tracking-wider">
                  ESCANEIE COM SEU APP DO BANCO
                </span>
              </div>

              {/* PIX Key and Copia e Cola field */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🔑 Chave PIX Oficial (E-mail / Aleatória):
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixKey} 
                      className="flex-1 px-3 py-2.5 bg-slate-900 border border-[#4f46e5]/60 rounded-xl text-white font-mono text-xs font-bold focus:outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyKeyOnly}
                      className="px-4 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKeyOnly ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKeyOnly ? 'Copiada!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    📋 Ou use o código PIX Copia e Cola:
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixCopyPasteCode} 
                      className="flex-1 px-3 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-xl text-emerald-400 font-mono text-xs focus:outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyPix}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm action */}
              <button 
                onClick={() => handleFinishAndOpenDiscord('PIX AUTOMÁTICO')}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Já fiz o pagamento via PIX!</span>
              </button>
              <div className="text-center mt-2.5 text-[11px] text-slate-400">
                Ao confirmar, você enviará a notificação no Discord e abrirá o ticket.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
