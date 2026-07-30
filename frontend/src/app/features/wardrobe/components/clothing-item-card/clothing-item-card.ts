import { Component, Input, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './clothing-item-card.html',
  styleUrl: './clothing-item-card.scss',
})
export class ClothingItemCard {
  private readonly router = inject(Router);

  @Input({ required: true }) item!: ClothingItem;

  readonly deleteItem = output<string>();

  openDetails(): void {
    void this.router.navigate(['/items', this.item._id]);
  }

  onCardKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openDetails();
    }
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteItem.emit(this.item._id);
  }
}
