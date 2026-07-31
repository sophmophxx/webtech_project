import { Component, Input, OnChanges, SimpleChanges, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateClothingItemRequest } from '../../../../core/services/clothing-item.service';
import { ClothingItem, ClothingItemCategory } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-form',
  imports: [ReactiveFormsModule],
  templateUrl: './clothing-item-form.html',
  styleUrl: './clothing-item-form.scss',
})
export class ClothingItemForm implements OnChanges {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  @Input() initialItem: ClothingItem | null = null;
  @Input() submitButtonLabel = 'Save item';

  readonly formSubmit = output<CreateClothingItemRequest>();

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
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.buildPayload());
  }

  /**
   * Builds the request payload from the form values.
   * Empty optional fields are removed so they are not sent to the backend.
   */
  private buildPayload(): CreateClothingItemRequest {
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
