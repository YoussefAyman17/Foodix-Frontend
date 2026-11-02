import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  mealId: string;
  name: string;
  img: string;
  price: number;
  quantity: number;
  selectedSize: string; // e.g., 'Single', 'Medium', 'Large'
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
    this.items().reduce((sum, i) => sum + (i.price + (i.selectedSizePrice || 0)) * i.quantity, 0),
  );

  // ====== Add to cart ======
  addItem(item: CartItem): void {
    const sizeName = item.selectedSize || 'Single';

    this.items.update((current) => {
      const existing = current.find((c) => c.mealId === item.mealId && c.selectedSize === sizeName);

      let updated: CartItem[];
      if (existing) {
        updated = current.map((c) =>
          c.mealId === item.mealId && c.selectedSize === sizeName
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        );
      } else {
        updated = [...current, { ...item, selectedSize: sizeName }];
      }

      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Remove item ======
  removeItem(mealId: string, selectedSize: string): void {
    this.items.update((current) => {
      const updated = current.filter(
        (c) => !(c.mealId === mealId && c.selectedSize === selectedSize),
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Update quantity ======
  updateQuantity(mealId: string, selectedSize: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(mealId, selectedSize);
      return;
    }

    this.items.update((current) => {
      const updated = current.map((c) =>
        c.mealId === mealId && c.selectedSize === selectedSize ? { ...c, quantity } : c,
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  // ====== Clear cart ======
  clearCart(): void {
    this.items.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CART_KEY);
    }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      }
    } catch {
      // Storage full or SSR context — fail silently
    }
  }
}
