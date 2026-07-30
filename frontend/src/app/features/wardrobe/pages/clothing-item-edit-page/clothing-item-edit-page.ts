import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  ClothingItemService,
  UpdateClothingItemRequest,
} from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { ClothingItemForm } from '../../components/clothing-item-form/clothing-item-form';

@Component({
  selector: 'app-clothing-item-edit-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ClothingItemForm],
  templateUrl: './clothing-item-edit-page.html',
  styleUrl: './clothing-item-edit-page.scss',
})
export class ClothingItemEditPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clothingItemService = inject(ClothingItemService);

  readonly item = signal<ClothingItem | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');

    if (!itemId) {
      this.errorMessage.set('Keine Item-ID gefunden.');
      this.isLoading.set(false);
      return;
    }

    this.loadItem(itemId);
  }

  updateItem(payload: UpdateClothingItemRequest): void {
    const currentItem = this.item();

    if (!currentItem) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.clothingItemService.updateItem(currentItem._id, payload).subscribe({
      next: (updatedItem) => {
        void this.router.navigate(['/items', updatedItem._id]);
      },
      error: () => {
        this.errorMessage.set('Kleidungsstück konnte nicht aktualisiert werden.');
        this.isSubmitting.set(false);
      },
    });
  }

  private loadItem(id: string): void {
    this.clothingItemService.getItemById(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Kleidungsstück konnte nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }
}
