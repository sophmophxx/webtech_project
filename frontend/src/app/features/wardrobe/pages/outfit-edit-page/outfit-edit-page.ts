import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { OutfitService, UpdateOutfitRequest } from '../../../../core/services/outfit.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { Outfit } from '../../../../shared/models/outfit.model';
import {
  CategoryFilter,
  CategoryFilterValue,
} from '../../components/category-filter/category-filter';

@Component({
  selector: 'app-outfit-edit-page',
  imports: [RouterLink, ReactiveFormsModule, MatProgressSpinnerModule, CategoryFilter],
  templateUrl: './outfit-edit-page.html',
  styleUrl: '../outfit-create-page/outfit-create-page.scss',
})
export class OutfitEditPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly clothingItemService = inject(ClothingItemService);
  private readonly outfitService = inject(OutfitService);

  readonly outfit = signal<Outfit | null>(null);
  readonly items = signal<ClothingItem[]>([]);
  readonly selectedItemIds = signal<Set<string>>(new Set());

  readonly selectedCategory = signal<CategoryFilterValue>('all');

  readonly filteredItems = computed(() => {
    const category = this.selectedCategory();

    return category === 'all'
      ? this.items()
      : this.items().filter((item) => item.category === category);
  });

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectionError = signal<string | null>(null);

  readonly outfitForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    notes: ['', [Validators.maxLength(500)]],
    favorite: [false],
  });

  /**
   * Loads the outfit and all available clothing items before rendering the edit form.
   */
  ngOnInit(): void {
    const outfitId = this.route.snapshot.paramMap.get('id');

    if (!outfitId) {
      this.errorMessage.set('No outfit id found.');
      this.isLoading.set(false);
      return;
    }

    this.loadEditorData(outfitId);
  }

  /**
   * Updates the category used to filter the available outfit pieces.
   */
  setCategory(category: CategoryFilterValue): void {
    this.selectedCategory.set(category);
  }

  /**
   * Adds or removes a clothing item from the current outfit selection.
   */
  toggleItemSelection(id: string): void {
    this.selectionError.set(null);

    this.selectedItemIds.update((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (nextSelection.has(id)) {
        nextSelection.delete(id);
      } else {
        nextSelection.add(id);
      }

      return nextSelection;
    });
  }

  /**
   * Checks whether a clothing item is currently selected.
   */
  isSelected(id: string): boolean {
    return this.selectedItemIds().has(id);
  }

  /**
   * Updates the current outfit with the form values and selected clothing items.
   */
  updateOutfit(): void {
    const currentOutfit = this.outfit();

    if (!currentOutfit) {
      return;
    }

    if (this.outfitForm.invalid) {
      this.outfitForm.markAllAsTouched();
      return;
    }

    if (this.selectedItemIds().size === 0) {
      this.selectionError.set('Select at least one piece for this outfit.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.outfitService.updateOutfit(currentOutfit._id, this.buildPayload()).subscribe({
      next: (updatedOutfit) => {
        void this.router.navigate(['/outfits', updatedOutfit._id]);
      },
      error: () => {
        this.errorMessage.set('Outfit could not be updated.');
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Loads the outfit and available clothing items in parallel.
   * Existing outfit values are then used to prefill the form and selection state.
   */
  private loadEditorData(outfitId: string): void {
    forkJoin({
      outfit: this.outfitService.getOutfitById(outfitId),
      items: this.clothingItemService.getItems(),
    }).subscribe({
      next: ({ outfit, items }) => {
        this.outfit.set(outfit);
        this.items.set(items);

        this.outfitForm.reset({
          name: outfit.name,
          notes: outfit.notes ?? '',
          favorite: outfit.favorite ?? false,
        });

        this.selectedItemIds.set(new Set(outfit.items.map((item) => item._id)));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Outfit could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Builds the request payload expected by the outfit update API.
   */
  private buildPayload(): UpdateOutfitRequest {
    const formValue = this.outfitForm.getRawValue();

    return {
      name: formValue.name.trim(),
      notes: formValue.notes.trim(),
      items: Array.from(this.selectedItemIds()),
      favorite: formValue.favorite,
    };
  }
}
