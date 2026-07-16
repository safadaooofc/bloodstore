import type { CartItem, Coupon, Order } from '../types/store';

interface PurchaseNotificationParams {
  storeName: string;
  discordNick: string;
  contactEmail?: string;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'PIX INSTANTÂNEO' | 'TICKET DISCORD' | string;
  webhookUrl: string;
  orderId?: string;
  pixKey?: string;
}

export async function sendDiscordPurchaseNotification(params: PurchaseNotificationParams): Promise<boolean> {
  if (!params.webhookUrl || !params.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.warn('URL do Webhook do Discord não está configurada ou é inválida:', params.webhookUrl);
    return false;
  }

  try {
    const itemsText = params.cart
      .map(item => `• **${item.quantity}x** ${item.product.name} — \`R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\``)
      .join('\n');

    const fields = [
      {
        name: '📑 ID do Pedido',
        value: `**\`${params.orderId || 'NOVO'}\`**`,
        inline: true
      },
      {
        name: '📌 Status atual',
        value: '`⏳ AGUARDANDO APROVAÇÃO`',
        inline: true
      },
      {
        name: '👤 Comprador (Discord)',
        value: `\`${params.discordNick}\``,
        inline: true
      },
      {
        name: '📧 Contato / E-mail',
        value: params.contactEmail ? `\`${params.contactEmail}\`` : '`Não informado`',
        inline: true
      },
      {
        name: '💳 Método de Pagamento',
        value: `**${params.paymentMethod}**`,
        inline: true
      },
      {
        name: '🔑 Chave PIX da Loja',
        value: `\`${params.pixKey || '14f35f4f-9255-496b-bd0e-2fce7d60af92'}\``,
        inline: true
      },
      {
        name: '📦 Itens Adquiridos',
        value: itemsText || 'Nenhum item',
        inline: false
      }
    ];

    if (params.appliedCoupon) {
      fields.push({
        name: '🎟️ Cupom de Desconto',
        value: `\`${params.appliedCoupon.code}\` (- R$ ${params.discountAmount.toFixed(2).replace('.', ',')})`,
        inline: true
      });
    }

    fields.push(
      {
        name: '💵 Subtotal',
        value: `R$ ${params.subtotal.toFixed(2).replace('.', ',')}`,
        inline: true
      },
      {
        name: '💰 Total do Pedido',
        value: `**R$ ${params.total.toFixed(2).replace('.', ',')}**`,
        inline: true
      }
    );

    const payload = {
      username: `${params.storeName} • Vendas & Pedidos`,
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png',
      embeds: [
        {
          title: `🛍️ Novo Pedido ${params.orderId ? `[#${params.orderId}]` : ''} Registrado!`,
          description: `Um novo pedido foi finalizado na **${params.storeName}** e está aguardando aprovação/liberação do estoque no Painel ou Discord.`,
          color: 5197801, // Indigo #4f46e5
          fields: fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: `${params.storeName} • Sistema de Entrega Automática`,
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png'
          }
        }
      ]
    };

    const response = await fetch(params.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Falha ao enviar notificação para o Webhook:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao chamar Webhook do Discord:', error);
    return false;
  }
}

export async function sendDiscordDeliveryNotification(order: Order, webhookUrl: string): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return false;
  }

  try {
    const itemsText = order.items
      .map(item => {
        const count = item.deliveredItems?.length || item.quantity;
        return `• **${item.quantity}x** ${item.productName}\n  └ ⚡ *${count} unidade(s) retirada(s) do estoque e enviada(s)!*`;
      })
      .join('\n\n');

    const fields = [
      {
        name: '📑 ID do Pedido',
        value: `**\`#${order.id}\`**`,
        inline: true
      },
      {
        name: '🚀 Status da Entrega',
        value: '`✅ APROVADO & ENTREGUE`',
        inline: true
      },
      {
        name: '👤 Comprador',
        value: `\`${order.buyerDiscordNick}\``,
        inline: true
      },
      {
        name: '📧 Destino (E-mail / Painel)',
        value: order.buyerEmail ? `\`${order.buyerEmail}\` (Enviado por E-mail)` : '`Painel / Acesso na Conta`',
        inline: false
      },
      {
        name: '📦 Itens Entregues Automaticamente',
        value: itemsText || 'Itens liberados no sistema.',
        inline: false
      }
    ];

    const payload = {
      username: 'Blood Store • Entrega Automática',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png',
      embeds: [
        {
          title: `🎉 PEDIDO #${order.id} APROVADO & LIBERADO!`,
          description: `O pedido foi **aprovado** pela administração e os produtos foram retirados do estoque e enviados automaticamente ao cliente!`,
          color: 1060933, // Green #10b981
          fields: fields,
          timestamp: new Date().toISOString(),
          footer: {
            text: `Blood Store • Estoque & Envio Automático`,
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png'
          }
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar notificação de entrega no Discord:', error);
    return false;
  }
}

export async function sendDiscordTestNotification(webhookUrl: string, storeName: string): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    return { success: false, message: 'URL do Webhook inválida. Verifique o link inserido.' };
  }

  try {
    const payload = {
      username: `${storeName} • Notificações`,
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png',
      embeds: [
        {
          title: '✅ Teste de Webhook Concluído!',
          description: `A integração entre a loja **${storeName}** e seu canal do Discord está funcionando perfeitamente. Todas as compras notificarão aqui!`,
          color: 1060933, // Green #10b981
          fields: [
            {
              name: '📌 Status da Conexão',
              value: 'Ativa e Sincronizada',
              inline: true
            },
            {
              name: '⚡ Sistema',
              value: 'Blood Store Clean Webhook',
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `${storeName} • Teste de Integração`
          }
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { success: false, message: `O Discord retornou erro (${response.status}). Verifique a URL do webhook.` };
    }

    return { success: true, message: 'Notificação de teste enviada com sucesso para o seu Discord!' };
  } catch (error) {
    return { success: false, message: 'Erro de conexão ao tentar enviar notificação.' };
  }
}
