import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import {
  ClothingItemService,
  CreateClothingItemRequest,
} from '../../../../core/services/clothing-item.service';
import { ClothingItem, ClothingItemCategory } from '../../../../shared/models/clothing-item.model';
import { ClothingItemCard } from '../../components/clothing-item-card/clothing-item-card';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-wardrobe-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    ClothingItemCard,
  ],
  templateUrl: './wardrobe-page.html',
  styleUrl: './wardrobe-page.scss',
})
export class WardrobePage implements OnInit {
  private readonly clothingItemService = inject(ClothingItemService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly items = signal<ClothingItem[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly categories: ClothingItemCategory[] = [
    'tops',
    'bottoms',
    'dresses',
    'outerwear',
    'shoes',
    'bags',
    'accessories',
    'other',
  ];

  readonly itemForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['tops' as ClothingItemCategory, [Validators.required]],
    brand: ['', [Validators.maxLength(100)]],
    color: ['', [Validators.maxLength(50)]],
    size: ['', [Validators.maxLength(20)]],
    imageUrl: [''],
    notes: ['', [Validators.maxLength(500)]],
    favorite: [false],
  });

  ngOnInit(): void {
    this.loadItems();
  }

  createItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const payload = this.buildCreatePayload();

    this.clothingItemService.createItem(payload).subscribe({
      next: (createdItem) => {
        this.items.update((items) => [createdItem, ...items]);
        this.itemForm.reset({
          name: '',
          category: 'tops',
          brand: '',
          color: '',
          size: '',
          imageUrl: '',
          notes: '',
          favorite: false,
        });
        this.isSubmitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Kleidungsstück konnte nicht angelegt werden.');
        this.isSubmitting.set(false);
      },
    });
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

  private buildCreatePayload(): CreateClothingItemRequest {
    const formValue = this.itemForm.getRawValue();

    return {
      name: formValue.name.trim(),
      category: formValue.category,
      ...(formValue.brand.trim() && { brand: formValue.brand.trim() }),
      ...(formValue.color.trim() && { color: formValue.color.trim() }),
      ...(formValue.size.trim() && { size: formValue.size.trim() }),
      ...(formValue.imageUrl.trim() && { imageUrl: formValue.imageUrl.trim() }),
      ...(formValue.notes.trim() && { notes: formValue.notes.trim() }),
      favorite: formValue.favorite,
    };
  }
}
