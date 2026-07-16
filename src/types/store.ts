export interface Product {
  id: string;
  slug: string;
  name: string;
  tag: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  imageUrl: string;
  badge?: 'MAIS VENDIDO' | 'ENTREGA IMEDIATA' | 'PROMOÇÃO' | 'EM ALTA' | 'EXCLUSIVO' | 'DESTAQUE' | 'ESPECIALIZADO';
  status: 'DISPONÍVEL' | 'PROMOÇÃO' | 'ESGOTADO';
  discordUrl?: string; // se vazio, usa o globalDiscordUrl da loja
  stockItems?: string[]; // Lista de itens (logins, contas, chaves, links) em estoque para entrega automática
}

export interface TermItem {
  id: string;
  title: string;
  content: string;
  category: 'PAGAMENTO' | 'ENTREGA' | 'SUPORTE' | 'REGRAS';
  isImportant?: boolean;
}

export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOCKOUT_TRIGGERED' | 'HONEYPOT_TRAPPED' | 'IDLE_TIMEOUT' | 'PANIC_LOCK';
  ipSignature: string;
  userAgent: string;
  details: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  globalName: string;
  avatarUrl: string;
  email?: string;
  joinedAt?: string;
}

export interface StoreConfig {
  storeName: string;
  bannerTitle: string;
  bannerSubtitle: string;
  announcementBanner: string;
  globalDiscordUrl: string;
  discordWebhookUrl: string;
  pixKey: string; // Chave PIX oficial da loja
  adminPassword: string;
  accentColor: string; // Ex: #4f46e5
  stats: {
    totalSales: number;
    activeUsers: number;
    satisfactionRate: string;
    averageDelivery: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  deliveredItems?: string[]; // Contas/Chaves entregues para este item após aprovação
}

export interface Order {
  id: string; // Ex: PED-1049
  createdAt: string;
  buyerDiscordNick: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod: string;
  pixKeyUsed?: string;
  status: 'pending' | 'approved' | 'rejected';
  deliveredAt?: string;
  emailSent?: boolean;
}

export type ViewTab = 'home' | 'terms' | 'admin' | 'checkout' | 'orders';
export type AdminTab = 'overview' | 'products' | 'stock' | 'orders' | 'terms' | 'settings' | 'security';
