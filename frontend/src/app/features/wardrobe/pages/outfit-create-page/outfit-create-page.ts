import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { CreateOutfitRequest, OutfitService } from '../../../../core/services/outfit.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-outfit-create-page',
  imports: [RouterLink, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './outfit-create-page.html',
  styleUrl: './outfit-create-page.scss',
})
export class OutfitCreatePage implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly clothingItemService = inject(ClothingItemService);
  private readonly outfitService = inject(OutfitService);
  private readonly router = inject(Router);

  readonly items = signal<ClothingItem[]>([]);
  readonly selectedItemIds = signal<Set<string>>(new Set());

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
   * Loads all clothing items so they can be selected for a new outfit.
   */
  ngOnInit(): void {
    this.loadItems();
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
   * Creates a new outfit from the form values and selected clothing item ids.
   */
  createOutfit(): void {
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

    this.outfitService.createOutfit(this.buildPayload()).subscribe({
      next: () => {
        void this.router.navigate(['/outfits']);
      },
      error: () => {
        this.errorMessage.set('Outfit could not be created.');
        this.isSubmitting.set(false);
      },
    });
  }

  /**
   * Loads available clothing items from the API.
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

  /**
   * Builds the request payload expected by the outfit API.
   */
  private buildPayload(): CreateOutfitRequest {
    const formValue = this.outfitForm.getRawValue();

    return {
      name: formValue.name.trim(),
      ...(formValue.notes.trim() && { notes: formValue.notes.trim() }),
      items: Array.from(this.selectedItemIds()),
      favorite: formValue.favorite,
    };
  }
}
