import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, TermItem, StoreConfig, ViewTab, AdminTab, CartItem, Coupon, DiscordUser, Order } from '../types/store';
import { sendDiscordDeliveryNotification } from '../services/discordWebhook';

interface StoreContextType {
  products: Product[];
  terms: TermItem[];
  config: StoreConfig;
  cart: CartItem[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  orders: Order[];
  isAdminLoggedIn: boolean;
  activeView: ViewTab;
  adminTab: AdminTab;
  searchQuery: string;
  selectedTag: string;
  setActiveView: (view: ViewTab) => void;
  setAdminTab: (tab: AdminTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string; coupon?: Coupon };
  setAppliedCoupon: (coupon: Coupon | null) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, stockItems: string[]) => void;
  addTerm: (term: Omit<TermItem, 'id'>) => void;
  updateTerm: (id: string, term: Partial<TermItem>) => void;
  deleteTerm: (id: string) => void;
  updateConfig: (newConfig: Partial<StoreConfig>) => void;
  resetToDefault: () => void;
  exportBackup: () => string;
  importBackup: (jsonString: string) => boolean;
  currentUser: DiscordUser | null;
  loginDiscord: (user: DiscordUser) => void;
  logoutDiscord: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  approveOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
  rejectOrder: (orderId: string) => void;
}

const DEFAULT_COUPONS: Coupon[] = [
  { code: 'BLOOD10', type: 'percentage', value: 10, description: '10% de desconto em qualquer item na Blood Store!' },
  { code: 'VIP20', type: 'percentage', value: 20, description: '20% de desconto exclusivo para membros VIP!' },
  { code: 'KIOVER', type: 'percentage', value: 15, description: '15% de desconto especial por indicação de parceiro!' }
];

const DEFAULT_CONFIG: StoreConfig = {
  storeName: 'Blood Store',
  bannerTitle: 'EXCELÊNCIA EM INFOPRODUTOS & SERVIÇOS',
  bannerSubtitle: 'Produtos digitais, otimizações e contas exclusivas com entrega rápida via Discord e garantia total.',
  announcementBanner: '⚡ BLOOD NOTICIA: ENTREGA EM ATÉ 24H VIA DISCORD // PAGAMENTO VIA PIX // ATENDIMENTO PRIORITÁRIO PARA BOOSTERS ⚡',
  globalDiscordUrl: 'https://discord.gg/Gvbg5WYPBP',
  discordWebhookUrl: 'https://discord.com/api/webhooks/1527312578898956409/u0DEYy-liGUA9w-e6fHjwlHNPDQmPzXoPR5lu5_jUGhcGheslAmBY2YDWOQF7k58O3Xm',
  pixKey: '14f35f4f-9255-496b-bd0e-2fce7d60af92',
  adminPassword: 'admin',
  accentColor: '#4f46e5',
  stats: {
    totalSales: 4890,
    activeUsers: 1420,
    satisfactionRate: '99.8%',
    averageDelivery: '12m'
  }
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'robux-r0b6x',
    name: 'Pacotes Robux (r0b6x) Premium',
    tag: 'ROBLOX',
    price: 35.90,
    originalPrice: 49.90,
    description: 'Pacotes seguros de Robux para sua conta Roblox com o melhor custo-benefício do mercado e entrega sem taxas extras pelo sistema de gamepass.',
    features: [
      'Entrega 100% limpa via Gamepass/Grupo',
      'Taxa de 30% coberta pela loja ou bônus',
      'Suporte humanizado no Discord',
      'Garantia anti-banimento do sistema'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?q=80&w=800&auto=format&fit=crop',
    badge: 'MAIS VENDIDO',
    status: 'DISPONÍVEL',
    stockItems: [
      'Robux-Pass #1049 - Código de Ativação / Acesso: RBX-9988-1122',
      'Robux-Pass #1050 - Código de Ativação / Acesso: RBX-7766-3344',
      'Robux-Pass #1051 - Código de Ativação / Acesso: RBX-5544-2211'
    ]
  },
  {
    id: 'prod-2',
    slug: 'conta-18v-c0nta-18v',
    name: 'Conta Verificada 18+ (c0nta-18v)',
    tag: 'CONTAS',
    price: 24.99,
    originalPrice: 39.99,
    description: 'Contas verificadas com verificação de idade +18 aprovada no Roblox/Discord. Perfeitas para voice chat, acesso a servidores adultos e total exclusividade.',
    features: [
      'Voice Chat (Áudio) habilitado imediato',
      'Dados de recuperação alteráveis pelo comprador',
      'Sem histórico de punições no sistema',
      'Acesso total (Full Acesso - FA)'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    badge: 'ENTREGA IMEDIATA',
    status: 'DISPONÍVEL',
    stockItems: [
      'Login: blood_acc18_01 | Senha: pass#18v_alpha | E-mail: rec1@bloodstore.gg',
      'Login: blood_acc18_02 | Senha: pass#18v_beta | E-mail: rec2@bloodstore.gg',
      'Login: blood_acc18_03 | Senha: pass#18v_gamma | E-mail: rec3@bloodstore.gg'
    ]
  },
  {
    id: 'prod-3',
    slug: 'jogos-steam-j0g0s-st34m',
    name: 'Chaves & Contas - Jogos Steam (j0g0s-st34m)',
    tag: 'STEAM',
    price: 49.90,
    originalPrice: 89.90,
    description: 'Chaves originais CD-Key e contas Full Acesso com jogos triplo A da Steam (GTA V, Elden Ring, Cyberpunk 2077, Rust, etc.) por uma fração do preço da loja oficial.',
    features: [
      'Chave global ativa em qualquer região do mundo',
      'Jogos originais e permanentes na sua biblioteca',
      'Opção de contas smurf/competitivas prontas para CS2',
      'Entrega garantida no mesmo dia via ticket'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    badge: 'PROMOÇÃO',
    status: 'PROMOÇÃO',
    stockItems: [
      'CD-KEY Steam Global: 88XX-99YY-11ZZ-BLOOD',
      'CD-KEY Steam Global: 77AA-33BB-55CC-BLOOD'
    ]
  },
  {
    id: 'prod-4',
    slug: 'murder-mystery-murd3r-myst3ry',
    name: 'Godlys & Itens Raros - Murder Mystery 2 (MM2)',
    tag: 'ROBLOX MM2',
    price: 15.00,
    originalPrice: 25.00,
    description: 'As facas, armas e pacotes Godly mais raros, Chroma e exclusivos do Murder Mystery 2 no Roblox. Domine todas as partidas com skins lendárias e visuais insanos.',
    features: [
      'Chroma Weapons, Corrupt, Icebreaker e muito mais',
      'Entrega express via Trade direta no jogo',
      'Combos especiais com descontos progressivos',
      'Segurança total nas negociações pelo nosso servidor'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    badge: 'EM ALTA',
    status: 'DISPONÍVEL',
    stockItems: [
      'Voucher Trade MM2 #01 - Entrar em contato com bot de trade @BloodTradeBot com código MM2-ALPHA'
    ]
  },
  {
    id: 'prod-5',
    slug: 'minecraft-m1n3cr4ft',
    name: 'Minecraft Full Acesso + Capas (m1n3cr4ft)',
    tag: 'MINECRAFT',
    price: 39.90,
    originalPrice: 75.00,
    description: 'Contas originais Microsoft Minecraft Java & Bedrock Edition (Full Acesso). Altere email, senha, nick e skin na hora. Opções com capas raras da Optifine ou Migração!',
    features: [
      'Acesso completo a servidores premium (Hypixel, 2b2t)',
      'Troca total de email e senha para os seus dados',
      'Inclui Java Edition e Bedrock Edition simultâneos',
      'Garantia vitalícia contra quedas'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=800&auto=format&fit=crop',
    badge: 'MAIS VENDIDO',
    status: 'DISPONÍVEL',
    stockItems: [
      'Conta Microsoft MC #1 | Email: mc_alpha@outlook.com | Senha: Mc#Blood2026',
      'Conta Microsoft MC #2 | Email: mc_beta@outlook.com | Senha: Mc#Blood2026'
    ]
  },
  {
    id: 'prod-6',
    slug: 'otimizacao-pc-ot1miz4ç40',
    name: 'Otimização Extrema de PC - FPS Boost (ot1miz4ç40)',
    tag: 'SERVIÇOS',
    price: 59.90,
    originalPrice: 120.00,
    description: 'Serviço profissional de otimização remota com nosso especialista técnico. Tweaks no registro do Windows, limpeza profunda de latência, overclock seguro e remoção de input lag.',
    features: [
      'Ganho real de até +120 FPS em jogos competitivos',
      'Redução drástica do Input Delay e Ping de rede',
      'Sessão remota via AnyDesk/TeamViewer no Discord',
      'Otimização personalizada para seu hardware específico'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop',
    badge: 'EXCLUSIVO',
    status: 'DISPONÍVEL',
    stockItems: [
      'Voucher Agendamento Técnico #01 - Acesse o canal #agendar-boost no Discord com o código BOOST-01'
    ]
  },
  {
    id: 'prod-7',
    slug: 'contas-nitro-c0nta-n1tr4d4',
    name: 'Contas Discord com Nitro Gaming/Boost (c0nta-n1tr4d4)',
    tag: 'DISCORD',
    price: 29.90,
    originalPrice: 55.00,
    description: 'Contas do Discord com Nitro Gaming ativo de 1 a 12 meses + 2 Impulsos de Servidor (Boosts) incluídos. Ou receba o token de ativação/gift no seu próprio perfil.',
    features: [
      'Nitro Gaming 100% original sem risco de queda',
      '2 Boosts de servidor para você impulsionar sua comunidade',
      'Acesso a emojis animados, banners em 4K e uploads grandes',
      'Entrega ultra rápida pelo nosso bot de auto-atendimento'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    badge: 'PROMOÇÃO',
    status: 'PROMOÇÃO',
    stockItems: [
      'Token/Gift Nitro #1: https://discord.gift/XyZ987AbC123Blood',
      'Token/Gift Nitro #2: https://discord.gift/QWe456RtY789Blood'
    ]
  },
  {
    id: 'prod-8',
    slug: 'seguidores-engajamento-s3gu1d0r3s',
    name: 'Seguidores & Engajamento Real (s3gu1d0r3s)',
    tag: 'ENGAJAMENTO',
    price: 19.90,
    originalPrice: 35.00,
    description: 'Pacotes de seguidores de alta retenção, curtidas e visualizações para Instagram, TikTok, Twitch ou YouTube. Cresça a autoridade da sua marca ou perfil de forma rápida e segura.',
    features: [
      'Perfis reais com fotos, bio e publicações no feed',
      'Início imediato após confirmação do pagamento',
      'Sem necessidade de informar senha (apenas @ ou link)',
      'Garantia de reposição automática de 30 a 60 dias'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    badge: 'ENTREGA IMEDIATA',
    status: 'DISPONÍVEL',
    stockItems: [
      'Voucher Painel de SMM #01 - Crédito de R$ 19,90 liberado no painel automático'
    ]
  }
];

const DEFAULT_TERMS: TermItem[] = [
  {
    id: 'term-1',
    title: 'Forma de pagamento',
    content: 'Apenas PIX. Nossa chave de pagamento e QRCode são fornecidos exclusivamente no momento do fechamento do ticket em nosso servidor do Discord ou no sistema automático.',
    category: 'PAGAMENTO',
    isImportant: true
  },
  {
    id: 'term-2',
    title: 'Reembolso',
    content: 'Não fazemos reembolso após a entrega, a menos que aconteça um erro por nossa parte. Todos os produtos e contas são pré-testados e entregues em perfeito funcionamento.',
    category: 'REGRAS',
    isImportant: true
  },
  {
    id: 'term-3',
    title: 'Prazo de entrega',
    content: 'Em até 24h (esse prazo pode mudar para reservas ou alta demanda). Não fiquem perturbando o dono ou a equipe para entregar, não temos somente um cliente para atender, então é só aguardar. Caso não seja entregue dentro do prazo, fazemos o reembolso integral no seu PIX.',
    category: 'ENTREGA',
    isImportant: true
  },
  {
    id: 'term-4',
    title: 'Pós entrega',
    content: 'Não nos responsabilizamos mais depois da entrega do produto/serviço. Ao receber seus dados ou itens, faça a alteração imediata de senhas, e-mails de recuperação e verificações de segurança conforme nossas instruções.',
    category: 'REGRAS'
  },
  {
    id: 'term-5',
    title: 'Atendimento e Prioridade Booster',
    content: 'Nós atendemos por ordem de chegada no Discord, então infelizmente nem sempre podemos responder de imediato, ainda mais se a demanda estiver alta. Se você for Booster do servidor (e dependendo da demanda), você tem direito de furar a fila e ganha prioridade especial no atendimento com nossa equipe de suporte VIP.',
    category: 'SUPORTE',
    isImportant: true
  },
  {
    id: 'term-6',
    title: 'Avaliação Obrigatória no Discord',
    content: 'Após todas as compras, é obrigatório deixar uma avaliação no canal "🌟・avaliações" do Discord. Somos muito gratos por quaisquer feedbacks. Caso contrário, o cliente receberá o cargo @proibido de comprar no servidor e perderá benefícios de fidelidade em futuras aquisições.',
    category: 'REGRAS',
    isImportant: true
  },
  {
    id: 'term-7',
    title: 'Observação Geral sobre Mudança de Termos',
    content: 'Os termos podem mudar sem aviso prévio. Antes de realizar qualquer compra na Blood Store, certifique-se de que está totalmente ciente e de acordo com os termos e condições descritos acima.',
    category: 'REGRAS'
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bloodstore_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [terms, setTerms] = useState<TermItem[]>(() => {
    const saved = localStorage.getItem('bloodstore_terms');
    return saved ? JSON.parse(saved) : DEFAULT_TERMS;
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('bloodstore_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        discordWebhookUrl: parsed.discordWebhookUrl || DEFAULT_CONFIG.discordWebhookUrl,
        pixKey: parsed.pixKey || DEFAULT_CONFIG.pixKey
      };
    }
    return DEFAULT_CONFIG;
  });

  const [currentUser, setCurrentUser] = useState<DiscordUser | null>(() => {
    const saved = localStorage.getItem('bloodstore_discord_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bloodstore_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('bloodstore_admin_auth') === 'true';
  });

  const [activeView, setActiveView] = useState<ViewTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('TODOS');

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bloodstore_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    localStorage.setItem('bloodstore_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('bloodstore_terms', JSON.stringify(terms));
  }, [terms]);

  useEffect(() => {
    localStorage.setItem('bloodstore_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('bloodstore_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('bloodstore_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bloodstore_discord_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bloodstore_discord_user');
    }
  }, [currentUser]);

  const loginDiscord = (user: DiscordUser) => {
    setCurrentUser(user);
  };

  const logoutDiscord = () => {
    setCurrentUser(null);
    localStorage.removeItem('bloodstore_discord_user');
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === cleanCode);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado!' };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom [${found.code}] aplicado com sucesso!`, coupon: found };
  };

  const loginAdmin = (password: string): boolean => {
    if (password === config.adminPassword) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('bloodstore_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('bloodstore_admin_auth');
    if (activeView === 'admin') {
      setActiveView('home');
    }
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    setProducts(prev => [ { ...newProd, id, stockItems: newProd.stockItems || [] }, ...prev ]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductStock = (productId: string, stockItems: string[]) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockItems } : p));
  };

  const addTerm = (newTerm: Omit<TermItem, 'id'>) => {
    const id = `term-${Date.now()}`;
    setTerms(prev => [ ...prev, { ...newTerm, id } ]);
  };

  const updateTerm = (id: string, updated: Partial<TermItem>) => {
    setTerms(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTerm = (id: string) => {
    setTerms(prev => prev.filter(t => t.id !== id));
  };

  const updateConfig = (newConfig: Partial<StoreConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetToDefault = () => {
    setProducts(DEFAULT_PRODUCTS);
    setTerms(DEFAULT_TERMS);
    setConfig(DEFAULT_CONFIG);
    setOrders([]);
    localStorage.removeItem('bloodstore_products');
    localStorage.removeItem('bloodstore_terms');
    localStorage.removeItem('bloodstore_config');
    localStorage.removeItem('bloodstore_orders');
    localStorage.removeItem('bloodstore_discord_user');
    setCurrentUser(null);
  };

  const exportBackup = (): string => {
    const data = {
      products,
      terms,
      config,
      orders,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
      if (data.terms && Array.isArray(data.terms)) {
        setTerms(data.terms);
      }
      if (data.config && typeof data.config === 'object') {
        setConfig(data.config);
      }
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
      return true;
    } catch (e) {
      console.error('Falha ao importar backup JSON', e);
      return false;
    }
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const id = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const approveOrder = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Pedido não encontrado.' };
    }

    if (targetOrder.status === 'approved') {
      return { success: false, message: 'O pedido já está aprovado.' };
    }

    // Processar entrega automática retirando do estoque (stockItems)
    const updatedProducts = [...products];
    const updatedItems = targetOrder.items.map(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        const prod = updatedProducts[productIndex];
        const stock = prod.stockItems || [];
        const delivered: string[] = [];
        
        for (let i = 0; i < item.quantity; i++) {
          if (stock.length > 0) {
            delivered.push(stock.shift()!);
          } else {
            delivered.push(`[ENTREGA MANUAL VIA DISCORD] - Item aguardando reposição de estoque.`);
          }
        }
        updatedProducts[productIndex] = { ...prod, stockItems: stock };
        return { ...item, deliveredItems: delivered };
      }
      return item;
    });

    setProducts(updatedProducts);

    const approvedOrder: Order = {
      ...targetOrder,
      items: updatedItems,
      status: 'approved',
      deliveredAt: new Date().toISOString(),
      emailSent: !!targetOrder.buyerEmail
    };

    setOrders(prev => prev.map(o => o.id === orderId ? approvedOrder : o));

    // Disparar Webhook no Discord informando aprovação e entrega automática
    try {
      await sendDiscordDeliveryNotification(approvedOrder, config.discordWebhookUrl);
    } catch (err) {
      console.error('Erro ao enviar notificação de entrega no Discord:', err);
    }

    return { 
      success: true, 
      message: `Pedido #${approvedOrder.id} APROVADO com sucesso! ${approvedOrder.buyerEmail ? `E-mail de entrega disparado para ${approvedOrder.buyerEmail}` : 'Estoque entregue no painel do usuário.'}` 
    };
  };

  const rejectOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o));
  };

  return (
    <StoreContext.Provider value={{
      products,
      terms,
      config,
      cart,
      coupons,
      appliedCoupon,
      orders,
      isAdminLoggedIn,
      activeView,
      adminTab,
      searchQuery,
      selectedTag,
      setActiveView,
      setAdminTab,
      setSearchQuery,
      setSelectedTag,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCoupon,
      setAppliedCoupon,
      loginAdmin,
      logoutAdmin,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      addTerm,
      updateTerm,
      deleteTerm,
      updateConfig,
      resetToDefault,
      exportBackup,
      importBackup,
      currentUser,
      loginDiscord,
      logoutDiscord,
      createOrder,
      approveOrder,
      rejectOrder
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};
