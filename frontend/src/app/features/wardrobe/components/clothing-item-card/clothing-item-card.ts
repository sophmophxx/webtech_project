import { Component, Input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-card',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './clothing-item-card.html',
  styleUrl: './clothing-item-card.scss',
})
export class ClothingItemCard {
  @Input({ required: true }) item!: ClothingItem;

  readonly deleteItem = output<string>();

  onDeleteClick(): void {
    this.deleteItem.emit(this.item._id);
  }
}
