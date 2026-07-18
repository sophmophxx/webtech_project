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

export type ClothingItemCategory =
  'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'bags' | 'accessories' | 'other';
