import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CreateClothingItemRequest } from '../../../../core/services/clothing-item.service';
import { ClothingItemCategory } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './clothing-item-form.html',
  styleUrl: './clothing-item-form.scss',
})
export class ClothingItemForm {
  private readonly formBuilder = inject(NonNullableFormBuilder);

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

  submitForm(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.buildCreatePayload());
    this.resetForm();
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

  private resetForm(): void {
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
  }
}
