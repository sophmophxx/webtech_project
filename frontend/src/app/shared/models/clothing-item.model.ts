export const CLOTHING_ITEM_CATEGORIES = [
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'shoes',
  'bags',
  'accessories',
  'other',
] as const;

export type ClothingItemCategory = (typeof CLOTHING_ITEM_CATEGORIES)[number];

export interface ClothingItem {
  _id: string;
  name: string;
  category: ClothingItemCategory;
  brand?: string;
  color?: string;
  size?: string;
  imageUrl?: string;
  notes?: string;
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
