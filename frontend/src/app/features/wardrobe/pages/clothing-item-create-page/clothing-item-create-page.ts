import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  ClothingItemService,
  CreateClothingItemRequest,
} from '../../../../core/services/clothing-item.service';
import { ClothingItemForm } from '../../components/clothing-item-form/clothing-item-form';

@Component({
  selector: 'app-clothing-item-create-page',
  imports: [RouterLink, ClothingItemForm],
  templateUrl: './clothing-item-create-page.html',
  styleUrl: './clothing-item-create-page.scss',
})
export class ClothingItemCreatePage {
  private readonly clothingItemService = inject(ClothingItemService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  createItem(payload: CreateClothingItemRequest): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.clothingItemService.createItem(payload).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage.set('Kleidungsstück konnte nicht angelegt werden.');
        this.isSubmitting.set(false);
      },
    });
  }
}
