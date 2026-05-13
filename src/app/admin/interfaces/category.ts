export interface Category {
  _id?: string;
  categoryId?: number;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  slug?: string;

  createdAt?: string;
  updatedAt?: string;

  itemsCount?: number;
  icon?: string;
  bgClass?: string;
}
