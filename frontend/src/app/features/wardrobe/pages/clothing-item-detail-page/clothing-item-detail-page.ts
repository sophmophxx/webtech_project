import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-detail-page',
  imports: [RouterLink, MatProgressSpinnerModule],
  templateUrl: './clothing-item-detail-page.html',
  styleUrl: './clothing-item-detail-page.scss',
})
export class ClothingItemDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clothingItemService = inject(ClothingItemService);

  readonly item = signal<ClothingItem | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Reads the item id from the route and loads the matching clothing item.
   * If no id is available, an error state is shown instead.
   */
  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');

    if (!itemId) {
      this.errorMessage.set('No item id found.');
      this.isLoading.set(false);
      return;
    }

    this.loadItem(itemId);
  }

  /**
   * Loads a single clothing item from the API and updates the page state.
   */
  private loadItem(id: string): void {
    this.clothingItemService.getItemById(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Item could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
