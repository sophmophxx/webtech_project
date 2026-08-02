import { Component, inject, Input, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-card',
  imports: [MatCardModule],
  templateUrl: './clothing-item-card.html',
  styleUrl: './clothing-item-card.scss',
})
export class ClothingItemCard {
  private readonly router = inject(Router);

  @Input({ required: true }) item!: ClothingItem;

  readonly deleteItem = output<string>();

  /**
   * Navigates to the detail page of the selected clothing item.
   */
  openDetails(): void {
    void this.router.navigate(['/items', this.item._id]);
  }

  /**
   * Makes the card keyboard-accessible by opening the detail page
   * when Enter or Space is pressed.
   */
  onCardKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openDetails();
    }
  }
}
