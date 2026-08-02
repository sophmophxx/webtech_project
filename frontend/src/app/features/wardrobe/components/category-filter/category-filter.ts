import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  CLOTHING_ITEM_CATEGORIES,
  ClothingItemCategory,
} from '../../../../shared/models/clothing-item.model';

export type CategoryFilterValue = 'all' | ClothingItemCategory;

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilter {
  readonly selectedCategory = input<CategoryFilterValue>('all');
  readonly ariaLabel = input('Filter items by category');
  readonly categoryChange = output<CategoryFilterValue>();

  readonly categories = CLOTHING_ITEM_CATEGORIES;

  selectCategory(category: CategoryFilterValue): void {
    this.categoryChange.emit(category);
  }
}
