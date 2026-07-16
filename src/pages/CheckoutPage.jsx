import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export const CheckoutPage = ({ onBackToStore }) => {
  const { config, products } = useStore();
  const [product, setProduct] = useState(null);
  const [discordUser, setDiscordUser] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Extrair ID do produto da URL (#/checkout?id=p1) ou sessionStorage
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      const prodId = params.get('id');
      if (prodId && products) {
        const found = products.find(p => p.id === prodId || p.slug === prodId);
        if (found) {
          setProduct(found);
          return;
        }
      }
    }
    // Fallback: tenta buscar de sessionStorage
    try {
      const savedProd = sessionStorage.getItem('bloodstore_checkout_item');
      if (savedProd) {
        setProduct(JSON.parse(savedProd));
      } else if (products && products.length > 0) {
        // Se nenhum foi selecionado, pega o primeiro por segurança
        setProduct(products[0]);
      }
    } catch (e) {
      if (products && products.length > 0) setProduct(products[0]);
    }
  }, [products]);

  if (!product) {
    return (
      <div className="checkout-loading-screen">
        <i className="fa-solid fa-spinner fa-spin text-red" style={{ fontSize: '2.5rem' }}></i>
        <p style={{ marginTop: '16px', color: '#a0a0b0' }}>Carregando dados do produto...</p>
        <button onClick={onBackToStore} className="btn-back-home" style={{ maxWidth: '220px', marginTop: '20px' }}>
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const benefits = Array.isArray(product.benefits) 
    ? product.benefits 
    : (typeof product.benefits === 'string' ? product.benefits.split('\n') : []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!discordUser.trim()) return;

    setLoading(true);
    const generatedId = `BLD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);

    // Disparar Webhook para o Discord se o Admin configurou
    if (config.webhookUrl) {
      const payload = {
        username: `${config.storeName} • Ticket Automático`,
        avatar_url: "https://i.imgur.com/8N40WzN.png",
        embeds: [{
          title: `🩸 NOVO PEDIDO CONFIRMADO • #${generatedId}`,
          description: `O cliente gerou a cobrança PIX na página exclusiva de checkout e está pronto para atendimento.`,
          color: 13369344, // #cc0000 vermelho
          fields: [
            { name: "🧑‍💻 Cliente (Discord)", value: `\`${discordUser}\``, inline: true },
            { name: "📦 Produto", value: `**${product.name}**`, inline: true },
            { name: "💰 Valor a Pagar", value: `**${product.priceText}**`, inline: true },
            { name: "📝 Observação / E-mail", value: customerNote.trim() ? `_${customerNote}_` : "_Nenhuma_", inline: false },
            { name: "🏷️ Código do Pedido", value: `\`${generatedId}\``, inline: true },
            { name: "📅 Data e Hora", value: new Date().toLocaleString("pt-BR"), inline: true },
            { name: "⚠️ Instrução para Suporte", value: "Aguarde o cliente enviar o print do comprovante PIX no canal de atendimento ou ticket.", inline: false }
          ],
          footer: { text: `${config.storeName} • Sistema Exclusivo de Vendas` },
          timestamp: new Date().toISOString()
        }]
      };

      try {
        await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.log("Aviso: Falha ou bloqueio CORS ao chamar Webhook:", err);
      }
    }

    setLoading(false);
    setOrderSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(config.pixKey).then(() => {
      alert("✅ Chave PIX copiada com sucesso para a área de transferência!");
    }).catch(() => {
      alert("Copie manualmente: " + config.pixKey);
    });
  };

  return (
    <div className="checkout-page-wrap">
      {/* CABEÇALHO EXCLUSIVO DO CHECKOUT */}
      <header className="checkout-topbar">
        <div className="container checkout-topbar-inner">
          <button onClick={onBackToStore} className="btn-checkout-back">
            <i className="fa-solid fa-arrow-left"></i> Voltar ao Catálogo
          </button>

          <div className="checkout-brand">
            <img 
              src="/fotos e videos/logo.png" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }} 
              alt={config.storeName} 
              style={{ maxHeight: '36px' }} 
            />
            <div className="brand-logo-icon" style={{ display: 'none', width: '36px', height: '36px', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-droplet"></i>
            </div>
            <span>CHECKOUT SEGURO</span>
          </div>

          <div className="checkout-security-badge">
            <i className="fa-solid fa-lock text-red"></i> Ambiente 256-bit SSL
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO CHECKOUT */}
      <main className="container checkout-main">
        {!orderSuccess ? (
          <div className="checkout-page-grid">
            {/* COLUNA 1: RESUMO DETALHADO DO PRODUTO E VALORES */}
            <div className="checkout-col-summary">
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <h3><i className="fa-solid fa-bag-shopping text-red"></i> Resumo do Seu Pedido</h3>
                  <span className="badge-exclusive">Entrega Imediata</span>
                </div>

                <div className="checkout-prod-profile">
                  <div className="checkout-prod-img-wrap">
                    <img 
                      src={product.image || "/fotos e videos/robux.png"} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }} 
                      alt={product.name} 
                    />
                    <div className="product-icon-fallback" style={{ display: 'none', width: '70px', height: '70px', fontSize: '2rem' }}>
                      <i className={product.icon || "fa-solid fa-box"}></i>
                    </div>
                  </div>
                  <div className="checkout-prod-info">
                    <h2 className="checkout-prod-title">{product.name}</h2>
                    <span className="checkout-prod-slug">{product.slug || product.name}</span>
                    <div className="checkout-prod-status">
                      <i className="fa-solid fa-circle-check text-red"></i> Disponível para Envio
                    </div>
                  </div>
                </div>

                {/* LISTA DE BENEFÍCIOS DO ITEM */}
                <div className="checkout-prod-benefits">
                  <h4>O que está incluso nesta compra:</h4>
                  <ul>
                    {benefits.map((b, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-check"></i>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TABELA DE VALORES */}
                <div className="checkout-price-box">
                  <div className="price-row">
                    <span>Subtotal do Produto</span>
                    <span>{product.priceText}</span>
                  </div>
                  <div className="price-row">
                    <span>Taxa de Entrega / PIX</span>
                    <span style={{ color: '#22c55e', fontWeight: '600' }}>GRÁTIS</span>
                  </div>
                  <div className="price-row divider"></div>
                  <div className="price-row total">
                    <span>Total a Pagar via PIX</span>
                    <span className="total-value">{product.priceText}</span>
                  </div>
                </div>

                <div className="checkout-guarantee-box">
                  <div className="guarantee-icon"><i className="fa-solid fa-shield-halved"></i></div>
                  <div>
                    <strong>Garantia de Satisfação {config.storeName}</strong>
                    <p>Entrega 100% assegurada ou seu dinheiro de volta. Suporte dedicado via Discord 7 dias por semana.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA 2: FORMULÁRIO DE IDENTIFICAÇÃO E PAGAMENTO PIX */}
            <div className="checkout-col-payment">
              <div className="checkout-card">
                <div className="checkout-steps-banner">
                  <div className="step-item active">
                    <span className="step-num">1</span>
                    <span className="step-label">Dados do Discord</span>
                  </div>
                  <div className="step-divider"><i className="fa-solid fa-chevron-right"></i></div>
                  <div className="step-item active">
                    <span className="step-num">2</span>
                    <span className="step-label">Pagamento PIX</span>
                  </div>
                  <div className="step-divider"><i className="fa-solid fa-chevron-right"></i></div>
                  <div className="step-item">
                    <span className="step-num">3</span>
                    <span className="step-label">Receber Produto</span>
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit} className="checkout-form">
                  <h3 className="form-section-title">
                    <i className="fa-brands fa-discord text-red"></i> Identificação para Atendimento
                  </h3>
                  <p className="form-section-subtitle">
                    Nosso sistema precisa do seu Discord para abrir o chamado de entrega assim que o pagamento for concluído.
                  </p>

                  <div className="form-group">
                    <label className="form-label" htmlFor="chk-discord">
                      Seu Usuário do Discord <span className="text-red">*</span>
                    </label>
                    <div className="input-with-icon">
                      <i className="fa-brands fa-discord input-icon"></i>
                      <input 
                        type="text" 
                        id="chk-discord" 
                        className="form-input has-icon" 
                        placeholder="ex: fulanogamer ou usuario#0000" 
                        value={discordUser}
                        onChange={(e) => setDiscordUser(e.target.value)}
                        required 
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="chk-note">
                      Observação Adicional / E-mail de Contato (Opcional)
                    </label>
                    <input 
                      type="text" 
                      id="chk-note" 
                      className="form-input" 
                      placeholder="ex: Prefiro entrega à noite / meu.email@exemplo.com" 
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                    />
                  </div>

                  <hr className="checkout-sep" />

                  <h3 className="form-section-title">
                    <i className="fa-solid fa-qrcode text-red"></i> Pagamento PIX Instantâneo
                  </h3>
                  <p className="form-section-subtitle">
                    Abra o app do seu banco, escolha a opção PIX Copia e Cola ou escaneie o QR Code abaixo:
                  </p>

                  <div className="checkout-pix-box">
                    <div className="pix-qr-area">
                      <img 
                        src="/fotos e videos/qrcode.png" 
                        onError={(e) => {
                          e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136BLOOD-STORE-PIX-EXCLUSIVE5204000053039865802BR5911BLOOD STORE6009SAO PAULO62070503***63041A2B&color=111116&bgcolor=FFFFFF';
                        }} 
                        alt="QR Code PIX" 
                      />
                      <span>Escaneie com o celular</span>
                    </div>

                    <div className="pix-info-area">
                      <div className="pix-badge-instant"><i className="fa-solid fa-bolt"></i> Aprovação em Segundos</div>
                      <label className="pix-code-title">Código PIX Copia e Cola:</label>
                      <div className="pix-code-field">
                        <input type="text" readOnly value={config.pixKey} />
                      </div>
                      <button type="button" onClick={copyPixCode} className="btn-copy-pix-large">
                        <i className="fa-solid fa-copy"></i> COPIAR CHAVE PIX AGORA
                      </button>
                    </div>
                  </div>

                  <div className="checkout-final-action">
                    <button type="submit" className="btn-submit-order" disabled={loading}>
                      {loading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> REGISTRANDO PEDIDO NO SISTEMA...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check-double"></i> JÁ REALIZEI O PIX • GERAR MEU ATENDIMENTO
                        </>
                      )}
                    </button>
                    <small className="checkout-disclaimer">
                      Ao clicar no botão acima, você concorda com nossos Termos e Políticas de Entrega e Reembolso.
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* TELA DE SUCESSO DO PEDIDO NA PRÓPRIA PÁGINA */
          <div className="checkout-success-view">
            <div className="success-card">
              <div className="success-icon-wrap">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2>Pedido #<code>{orderId}</code> Registrado!</h2>
              <p className="success-sub">
                Seu ticket foi notificado para nossa equipe no Discord em tempo real. Agora só falta enviar o seu comprovante PIX!
              </p>

              <div className="success-summary-box">
                <div className="success-item">
                  <span>Produto:</span>
                  <strong>{product.name}</strong>
                </div>
                <div className="success-item">
                  <span>Valor Pago via PIX:</span>
                  <strong className="text-red">{product.priceText}</strong>
                </div>
                <div className="success-item">
                  <span>Usuário do Discord informado:</span>
                  <code>{discordUser}</code>
                </div>
              </div>

              <div className="success-steps-box">
                <h4>Próximo passo para liberação do seu produto:</h4>
                <ol>
                  <li>
                    Acesse nosso servidor oficial no Discord clicando no botão verde abaixo.
                  </li>
                  <li>
                    Abra um ticket na categoria <strong>#🎫・pedidos</strong> e envie o print/comprovante do PIX junto com o número do pedido <code>{orderId}</code>.
                  </li>
                  <li>
                    Nossa equipe liberará seu item/conta em poucos minutos!
                  </li>
                </ol>
              </div>

              <div className="success-actions">
                <a 
                  href={config.discordInvite || "https://discord.gg/Gvbg5WYPBP"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-discord-join-large"
                >
                  <i className="fa-brands fa-discord"></i> ENTRAR NO DISCORD E ENVIAR COMPROVANTE
                </a>
                <button onClick={onBackToStore} className="btn-back-home-alt">
                  <i className="fa-solid fa-store"></i> Voltar à Vitrine da Loja
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
