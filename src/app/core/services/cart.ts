import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  mealId: string;
  name: string;
  img: string;
  price: number;
  quantity: number;
  selectedSizePrice: number;
}

const CART_KEY = 'foodix_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  // ====== State ======
  items = signal<CartItem[]>(this.loadFromStorage());

  // ====== Computed ======
  totalItems = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  subtotal = computed(() =>
    this.items().reduce((sum, i) => sum + (i.price + i.selectedSizePrice) * i.quantity, 0),
  );

  // ====== Add to cart ======
  addItem(item: CartItem): void {
    this.items.update((current) => {
      const existing = current.find(
        (c) => c.mealId === item.mealId && c.selectedSizePrice === item.selectedSizePrice,
      );

      let updated: CartItem[];
      if (existing) {
        // زود الكمية لو الأيتم موجود بنفس الحجم
        updated = current.map((c) =>
          c.mealId === item.mealId && c.selectedSizePrice === item.selectedSizePrice
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        );
      } else {
        updated = [...current, item];
      }

      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Remove item ======
  removeItem(mealId: string, selectedSizePrice: number): void {
    this.items.update((current) => {
      const updated = current.filter(
        (c) => !(c.mealId === mealId && c.selectedSizePrice === selectedSizePrice),
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Update quantity ======
  updateQuantity(mealId: string, selectedSizePrice: number, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(mealId, selectedSizePrice);
      return;
    }
    this.items.update((current) => {
      const updated = current.map((c) =>
        c.mealId === mealId && c.selectedSizePrice === selectedSizePrice ? { ...c, quantity } : c,
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Clear cart ======
  clearCart(): void {
    this.items.set([]);
    localStorage.removeItem(CART_KEY);
  }

  // ====== Storage helpers ======
  private loadFromStorage(): CartItem[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // SSR or storage full — fail silently
    }
  }
}
