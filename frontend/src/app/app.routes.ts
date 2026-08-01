import { Routes } from '@angular/router';
import { WardrobePage } from './features/wardrobe/pages/wardrobe-page/wardrobe-page';
import { ClothingItemCreatePage } from './features/wardrobe/pages/clothing-item-create-page/clothing-item-create-page';
import { ClothingItemDetailPage } from './features/wardrobe/pages/clothing-item-detail-page/clothing-item-detail-page';
import { ClothingItemEditPage } from './features/wardrobe/pages/clothing-item-edit-page/clothing-item-edit-page';
import { OutfitCreatePage } from './features/wardrobe/pages/outfit-create-page/outfit-create-page';
import { OutfitsPage } from './features/wardrobe/pages/outfits-page/outfits-page';
import { OutfitDetailPage } from './features/wardrobe/pages/outfit-detail-page/outfit-detail-page';
import { OutfitEditPage } from './features/wardrobe/pages/outfit-edit-page/outfit-edit-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: WardrobePage,
  },
  {
    path: 'outfits/new',
    component: OutfitCreatePage,
  },
  {
    path: 'outfits/:id/edit',
    component: OutfitEditPage,
  },
  {
    path: 'outfits/:id',
    component: OutfitDetailPage,
  },
  {
    path: 'outfits',
    component: OutfitsPage,
  },
  {
    path: 'items/new',
    component: ClothingItemCreatePage,
  },
  {
    path: 'items/:id/edit',
    component: ClothingItemEditPage,
  },
  {
    path: 'items/:id',
    component: ClothingItemDetailPage,
  },
];
