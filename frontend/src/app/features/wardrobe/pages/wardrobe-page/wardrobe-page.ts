import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { ClothingItemCard } from '../../components/clothing-item-card/clothing-item-card';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-wardrobe-page',
  imports: [RouterLink, MatProgressSpinnerModule, ClothingItemCard, MatIcon],
  templateUrl: './wardrobe-page.html',
  styleUrl: './wardrobe-page.scss',
})
export class WardrobePage implements OnInit {
  private readonly clothingItemService = inject(ClothingItemService);

  readonly items = signal<ClothingItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Loads all clothing items when the wardrobe overview is opened.
   */
  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Deletes a clothing item through the API.
   * After a successful deletion, the item is removed from the local page state.
   */
  deleteItem(id: string): void {
    this.clothingItemService.deleteItem(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((item) => item._id !== id));
      },
      error: () => {
        this.errorMessage.set('Item could not be deleted.');
      },
    });
  }

  /**
   * Loads all clothing items from the API and updates loading and error states.
   */
  private loadItems(): void {
    this.clothingItemService.getItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Items could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
