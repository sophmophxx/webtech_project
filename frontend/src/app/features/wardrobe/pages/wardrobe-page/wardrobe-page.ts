import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import {
  CategoryFilter,
  CategoryFilterValue,
} from '../../components/category-filter/category-filter';
import { ClothingItemCard } from '../../components/clothing-item-card/clothing-item-card';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-wardrobe-page',
  imports: [RouterLink, MatProgressSpinnerModule, ClothingItemCard, CategoryFilter, MatIcon],
  templateUrl: './wardrobe-page.html',
  styleUrl: './wardrobe-page.scss',
})
export class WardrobePage implements OnInit {
  private readonly clothingItemService = inject(ClothingItemService);

  readonly items = signal<ClothingItem[]>([]);
  readonly selectedCategory = signal<CategoryFilterValue>('all');
  readonly filteredItems = computed(() => {
    const category = this.selectedCategory();

    return category === 'all'
      ? this.items()
      : this.items().filter((item) => item.category === category);
  });
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Loads all clothing items when the wardrobe overview is opened.
   */
  ngOnInit(): void {
    this.loadItems();
  }

  /**
   * Updates the category used to filter the wardrobe grid.
   */
  setCategory(category: CategoryFilterValue): void {
    this.selectedCategory.set(category);
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
