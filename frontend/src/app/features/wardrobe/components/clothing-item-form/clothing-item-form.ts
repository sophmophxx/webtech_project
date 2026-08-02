import { Component, Input, OnChanges, SimpleChanges, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { CreateClothingItemRequest } from '../../../../core/services/clothing-item.service';
import {
  CLOTHING_ITEM_CATEGORIES,
  ClothingItem,
  ClothingItemCategory,
} from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-form',
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './clothing-item-form.html',
  styleUrl: './clothing-item-form.scss',
})
export class ClothingItemForm implements OnChanges {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  @Input() initialItem: ClothingItem | null = null;
  @Input() submitButtonLabel = 'Save item';
  @Input() cancelLink: string | readonly string[] | null = null;

  readonly formSubmit = output<CreateClothingItemRequest>();

  readonly categories: readonly ClothingItemCategory[] = CLOTHING_ITEM_CATEGORIES;

  readonly itemForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: this.formBuilder.control<ClothingItemCategory | ''>('', [Validators.required]),
    brand: ['', [Validators.maxLength(100)]],
    color: ['', [Validators.maxLength(50)]],
    size: ['', [Validators.maxLength(20)]],
    imageUrl: [''],
    notes: ['', [Validators.maxLength(500)]],
    favorite: [false],
  });

  /**
   * Prefills the form when an existing item is passed in.
   * This allows the same form component to be reused for creating and editing items.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialItem'] && this.initialItem) {
      this.itemForm.reset({
        name: this.initialItem.name,
        category: this.initialItem.category,
        brand: this.initialItem.brand ?? '',
        color: this.initialItem.color ?? '',
        size: this.initialItem.size ?? '',
        imageUrl: this.initialItem.imageUrl ?? '',
        notes: this.initialItem.notes ?? '',
        favorite: this.initialItem.favorite ?? false,
      });
    }
  }

  /**
   * Validates the form and emits a cleaned payload to the parent component.
   */
  submitForm(): void {
    const category = this.itemForm.controls.category.value;

    if (this.itemForm.invalid || !category) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.buildPayload(category));
  }

  /**
   * Builds the request payload from the form values.
   * Empty optional fields are removed so they are not sent to the backend.
   */
  private buildPayload(category: ClothingItemCategory): CreateClothingItemRequest {
    const formValue = this.itemForm.getRawValue();

    return {
      name: formValue.name.trim(),
      category,
      ...(formValue.brand.trim() && { brand: formValue.brand.trim() }),
      ...(formValue.color.trim() && { color: formValue.color.trim() }),
      ...(formValue.size.trim() && { size: formValue.size.trim() }),
      ...(formValue.imageUrl.trim() && { imageUrl: formValue.imageUrl.trim() }),
      ...(formValue.notes.trim() && { notes: formValue.notes.trim() }),
      favorite: formValue.favorite,
    };
  }
}
