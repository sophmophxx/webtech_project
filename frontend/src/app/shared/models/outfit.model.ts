import { ClothingItem } from './clothing-item.model';

export interface Outfit {
  _id: string;
  name: string;
  notes?: string;
  items: ClothingItem[];
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
