import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { ClothingItemCard } from '../../components/clothing-item-card/clothing-item-card';
import { MatButtonModule } from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-wardrobe-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, ClothingItemCard],
  templateUrl: './wardrobe-page.html',
  styleUrl: './wardrobe-page.scss',
})
export class WardrobePage implements OnInit {
  private readonly clothingItemService = inject(ClothingItemService);

  readonly items = signal<ClothingItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  deleteItem(id: string): void {
    this.clothingItemService.deleteItem(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((item) => item._id !== id));
      },
      error: () => {
        this.errorMessage.set('Kleidungsstück konnte nicht gelöscht werden.');
      },
    });
  }

  private loadItems(): void {
    this.clothingItemService.getItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Kleidungsstücke konnten nicht geladen werden.');
        this.isLoading.set(false);
      },
    });
  }
}
