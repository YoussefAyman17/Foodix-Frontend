import { Category } from './category';

export interface MealSize {
  size: 'S' | 'M' | 'L' | 'XL' | 'Single' | 'Double' | 'Triple' | 'Family';
  extraPrice?: number;
}

export interface Meal {
  _id?: string;
  itemId?: number;

  category: Category;
  name: string;

  on_sale?: boolean;
  old_price?: number | null;
  price: number;
  rating?: number;
  discount_tag?: string | null;

  short_description?: string;
  description?: string;

  img?: string;

  isAvailable?: boolean;

  sizes?: MealSize[];

  quantity?: number;

  slug?: string;

  orders_count?: number;

  createdAt?: string;
  updatedAt?: string;
}
