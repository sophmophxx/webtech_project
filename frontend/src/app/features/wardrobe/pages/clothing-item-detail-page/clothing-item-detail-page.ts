import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);
  private readonly clothingItemService = inject(ClothingItemService);

  readonly item = signal<ClothingItem | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly backLink = signal('/');
  readonly backLabel = signal('Back to archive');
  readonly showDeleteConfirmation = signal(false);
  readonly isDeleting = signal(false);
  readonly deleteErrorMessage = signal<string | null>(null);

  /**
   * Reads the item id from the route and loads the matching clothing item.
   * If no id is available, an error state is shown instead.
   */
  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');

    if (returnTo?.startsWith('/outfits/')) {
      this.backLink.set(returnTo);
      this.backLabel.set('Back to outfit');
    }

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

  /**
   * Shows the delete confirmation for the current item.
   */
  requestDelete(): void {
    this.deleteErrorMessage.set(null);
    this.showDeleteConfirmation.set(true);
  }

  /**
   * Hides the delete confirmation without deleting the item.
   */
  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
    this.deleteErrorMessage.set(null);
  }

  /**
   * Deletes the current item and navigates back to the archive.
   *
   * The backend also removes the item from referenced outfits
   * and deletes outfits that no longer contain any items.
   */
  deleteItem(): void {
    const currentItem = this.item();

    if (!currentItem) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.clothingItemService.deleteItem(currentItem._id).subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
      error: () => {
        this.deleteErrorMessage.set('Item could not be deleted.');
        this.isDeleting.set(false);
      },
    });
  }
}
