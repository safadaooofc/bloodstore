import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const SplitCheckoutModal = ({ product, onClose }) => {
  const { config } = useStore();
  const [discordUser, setDiscordUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!product) return null;

  const benefits = Array.isArray(product.benefits) 
    ? product.benefits 
    : (typeof product.benefits === 'string' ? product.benefits.split('\n') : []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!discordUser.trim()) return;

    setLoading(true);

    // Disparar Webhook para o Discord se o Admin configurou a URL
    if (config.webhookUrl) {
      const payload = {
        username: `${config.storeName} • Pedidos`,
        avatar_url: "https://i.imgur.com/8N40WzN.png",
        embeds: [{
          title: `🩸 NOVO PEDIDO - ${config.storeName}`,
          description: "O cliente concluiu o checkout no site e gerou a chave de pagamento PIX.",
          color: 13369344, // #cc0000 vermelho
          fields: [
            { name: "🧑‍💻 Cliente (Discord)", value: `\`${discordUser}\``, inline: true },
            { name: "📦 Produto Escolhido", value: `**${product.name}**`, inline: true },
            { name: "💰 Valor do Produto", value: `**${product.priceText}**`, inline: true },
            { name: "📅 Data e Hora", value: new Date().toLocaleString("pt-BR"), inline: false },
            { name: "🔔 Status", value: "⚠️ **Aguardando confirmação e envio de comprovante em Ticket**", inline: false }
          ],
          footer: { text: `${config.storeName} • Sistema de Vendas Automático` },
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
        console.log("Aviso: Erro ao notificar Webhook (pode ser URL de teste ou bloqueado pelo navegador):", err);
      }
    }

    setLoading(false);
    setOrderSuccess(true);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(config.pixKey).then(() => {
      alert("Chave PIX copiada com sucesso para a área de transferência!");
    }).catch(() => {
      alert("Copie manualmente: " + config.pixKey);
    });
  };

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="modal-split-box">
        {/* COLUNA DA ESQUERDA: RESUMO DO PEDIDO */}
        <div className="checkout-summary-col">
          <div>
            <div className="summary-header-badge">
              <i className="fa-solid fa-shield-check"></i> Resumo do Pedido • {config.storeName}
            </div>
            <h3 className="summary-prod-name">{product.name}</h3>

            <div className="summary-img-wrap">
              <img 
                src={product.image || "/fotos e videos/robux.png"} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }} 
                alt={product.name} 
                className="summary-img" 
              />
              <div className="product-icon-fallback" style={{ display: 'none', width: '56px', height: '56px', fontSize: '1.6rem' }}>
                <i className={product.icon || "fa-solid fa-box"}></i>
              </div>
            </div>

            <div className="summary-total-price">
              <span>Total a Pagar</span>
              {product.priceText}
            </div>

            <ul className="summary-highlights">
              {benefits.map((b, idx) => (
                <li key={idx}>
                  <i className="fa-solid fa-check"></i> {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="summary-warning-box">
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.1rem', marginTop: '2px' }}></i>
            <span><strong>Aviso Importante:</strong> Ao clicar em finalizar, envie o comprovante no nosso canal de Ticket no Discord.</span>
          </div>
        </div>

        {/* COLUNA DA DIREITA: DADOS DO CLIENTE E PAGAMENTO PIX */}
        <div className="checkout-action-col">
          <button className="modal-close-split" onClick={onClose} title="Fechar"><i className="fa-solid fa-xmark"></i></button>

          <div>
            <div className="action-col-header">
              <h4>Dados & Pagamento</h4>
              <p>Preencha seu Discord para gerarmos o atendimento em tempo real.</p>
            </div>

            <form onSubmit={handleOrderSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="split-discord-input">
                  Seu Usuário no Discord (ex: usuario#0000 ou usuario) <span className="text-red">*</span>
                </label>
                <input 
                  type="text" 
                  id="split-discord-input" 
                  className="form-input" 
                  placeholder="ex: fulano#0000 ou fulanogamer" 
                  value={discordUser}
                  onChange={(e) => setDiscordUser(e.target.value)}
                  required 
                  autoComplete="off"
                  disabled={orderSuccess}
                />
              </div>

              {/* Área do PIX e QR Code */}
              <div className="pix-display-area">
                <div className="pix-qr-compact">
                  <img 
                    src="/fotos e videos/qrcode.png" 
                    onError={(e) => {
                      e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=00020126580014br.gov.bcb.pix0136BLOOD-STORE-PIX-EXCLUSIVE5204000053039865802BR5911BLOOD STORE6009SAO PAULO62070503***63041A2B&color=111116&bgcolor=FFFFFF';
                    }} 
                    alt="QR Code PIX" 
                  />
                </div>

                <div className="pix-code-info">
                  <div className="pix-code-label"><i className="fa-solid fa-qrcode text-red"></i> PIX Copia e Cola</div>
                  <div className="pix-code-string" title={config.pixKey}>{config.pixKey}</div>
                  <button type="button" onClick={copyPixCode} className="btn-copy-pix">
                    <i className="fa-solid fa-copy"></i> Copiar Código
                  </button>
                </div>
              </div>

              {!orderSuccess && (
                <button type="submit" className="btn-complete-order" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Notificando Discord...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check-to-slot"></i> CONCLUIR PEDIDO E GERAR TICKET
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {orderSuccess && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', borderRadius: '8px', padding: '14px', marginTop: '12px', fontSize: '0.88rem', color: '#4ade80', textAlign: 'center' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '1.2rem', marginBottom: '6px' }}></i>
              <strong style={{ display: 'block' }}>Pedido e Ticket Gerados!</strong>
              Obrigado, <code style={{ color: '#fff', background: '#111', padding: '2px 6px', borderRadius: '4px' }}>{discordUser}</code>.<br />
              Copie a chave PIX acima e envie seu comprovante via Ticket em nosso Discord.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
