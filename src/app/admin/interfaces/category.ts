export interface Category {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  slug?: string;
  mealsCount: number;

  createdAt?: string;
  updatedAt?: string;

  itemsCount?: number;
}
