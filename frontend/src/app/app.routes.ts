import { Routes } from '@angular/router';
import { WardrobePage } from './features/wardrobe/pages/wardrobe-page/wardrobe-page';
import { ClothingItemCreatePage } from './features/wardrobe/pages/clothing-item-create-page/clothing-item-create-page';
import { ClothingItemDetailPage } from './features/wardrobe/pages/clothing-item-detail-page/clothing-item-detail-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: WardrobePage,
  },
  {
    path: 'items/new',
    component: ClothingItemCreatePage,
  },
  {
    path: 'items/:id',
    component: ClothingItemDetailPage,
  },
];
