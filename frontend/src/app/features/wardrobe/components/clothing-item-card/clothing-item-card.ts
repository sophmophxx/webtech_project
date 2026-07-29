import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-card',
  imports: [MatCardModule],
  templateUrl: './clothing-item-card.html',
  styleUrl: './clothing-item-card.scss',
})
export class ClothingItemCard {
  @Input({ required: true }) item!: ClothingItem;
}
