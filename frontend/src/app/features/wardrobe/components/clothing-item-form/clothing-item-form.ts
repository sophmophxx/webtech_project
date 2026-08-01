import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateClothingItemRequest } from '../../../../core/services/clothing-item.service';
import { ImageUploadService } from '../../../../core/services/image-upload.service';
import { ClothingItem, ClothingItemCategory } from '../../../../shared/models/clothing-item.model';

@Component({
  selector: 'app-clothing-item-form',
  imports: [ReactiveFormsModule],
  templateUrl: './clothing-item-form.html',
  styleUrl: './clothing-item-form.scss',
})
export class ClothingItemForm implements OnChanges, OnDestroy {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly imageUploadService = inject(ImageUploadService);

  private selectedImageFile: File | null = null;
  private objectUrl: string | null = null;

  @Input() initialItem: ClothingItem | null = null;
  @Input() submitButtonLabel = 'Save item';

  readonly formSubmit = output<CreateClothingItemRequest>();

  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageUploadError = signal<string | null>(null);
  readonly isUploading = signal(false);
  readonly selectedImageName = signal<string | null>(null);

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

      this.imagePreviewUrl.set(this.initialItem.imageUrl ?? null);
    }
  }

  /**
   * Cleans up temporary browser object URLs used for local image previews.
   */
  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  /**
   * Stores the selected image file locally and shows a preview before upload.
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.imageUploadError.set(null);

    if (!file) {
      this.selectedImageName.set(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.selectedImageFile = null;
      this.selectedImageName.set(null);
      this.imageUploadError.set('Only JPG, PNG and WEBP images are allowed.');
      input.value = '';
      return;
    }

    if (file.size > maxFileSize) {
      this.selectedImageFile = null;
      this.selectedImageName.set(null);
      this.imageUploadError.set('Image must be smaller than 5 MB.');
      input.value = '';
      return;
    }

    this.selectedImageFile = file;
    this.selectedImageName.set(file.name);

    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.imagePreviewUrl.set(this.objectUrl);
  }

  /**
   * Validates the form, uploads a selected image if necessary,
   * and emits a cleaned payload to the parent component.
   */
  submitForm(): void {
    if (this.isUploading()) {
      return;
    }

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    if (!this.selectedImageFile) {
      this.formSubmit.emit(this.buildPayload());
      return;
    }

    this.isUploading.set(true);
    this.imageUploadError.set(null);

    this.imageUploadService.uploadImage(this.selectedImageFile).subscribe({
      next: (response) => {
        this.itemForm.patchValue({
          imageUrl: response.imageUrl,
        });

        this.selectedImageFile = null;
        this.isUploading.set(false);
        this.formSubmit.emit(this.buildPayload());
      },
      error: () => {
        this.imageUploadError.set('Image could not be uploaded.');
        this.isUploading.set(false);
      },
    });
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

  /**
   * Removes the previous temporary preview URL from memory.
   */
  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
