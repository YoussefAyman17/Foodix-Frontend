export interface OrderItem {
  _id?: string;
  foodItem: any;
  size: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface ShippingAddress {
  city: string;
  area: string;
  street: string;
  building?: string;
  floor?: number;
  apartment?: number;
  contactPhone: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderId: number;
  userId: { userName: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryPerson?: any;
  itemsPrice: number;
  deliveryPrice: number;
  discount: number;
  couponCode?: string;
  totalPrice: number;
  paymentMethod: 'Cash' | 'Stripe';
  paymentInfo?: any;
  isPaid: boolean;
  paidAt?: string;
  status: 'Pending' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';
  createdAt: string;
  deliveredAt?: string;
}
