import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClothingItemForm } from './clothing-item-form';
import { CreateClothingItemRequest } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

describe('ClothingItemForm', () => {
  let fixture: ComponentFixture<ClothingItemForm>;
  let component: ClothingItemForm;

  const mockItem = {
    _id: 'item-1',
    name: 'Black Blazer',
    category: 'outerwear',
    brand: 'ARKET',
    color: 'Black',
    size: 'S',
    imageUrl: '/uploads/black-blazer.jpg',
    notes: 'Oversized fit.',
    favorite: true,
  } as ClothingItem;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingItemForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ClothingItemForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with default form values', () => {
    expect(component).toBeTruthy();

    expect(component.itemForm.getRawValue()).toEqual({
      name: '',
      category: '',
      brand: '',
      color: '',
      size: '',
      imageUrl: '',
      notes: '',
      favorite: false,
    });

    expect(component.submitButtonLabel).toBe('Save item');
  });

  it('should provide all available clothing item categories', () => {
    expect(component.categories).toEqual([
      'tops',
      'bottoms',
      'dresses',
      'outerwear',
      'shoes',
      'bags',
      'accessories',
      'other',
    ]);

    const element = fixture.nativeElement as HTMLElement;

    const options = element.querySelectorAll<HTMLOptionElement>(
      'select[formControlName="category"] option',
    );

    expect(options.length).toBe(9);

    expect(options[0].value).toBe('');
    expect(options[0].textContent?.trim()).toBe('select category');
    expect(options[0].disabled).toBe(true);

    const categoryOptions = Array.from(options).slice(1);

    expect(categoryOptions.map((option) => option.value)).toEqual(component.categories);

    expect(categoryOptions.map((option) => option.textContent?.trim())).toEqual([
      'Tops',
      'Bottoms',
      'Dresses',
      'Outerwear',
      'Shoes',
      'Bags',
      'Accessories',
      'Other',
    ]);
  });

  it('should prefill the form when an initial item is provided', () => {
    fixture.componentRef.setInput('initialItem', mockItem);
    fixture.detectChanges();

    expect(component.itemForm.getRawValue()).toEqual({
      name: 'Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      color: 'Black',
      size: 'S',
      imageUrl: '/uploads/black-blazer.jpg',
      notes: 'Oversized fit.',
      favorite: true,
    });

    const element = fixture.nativeElement as HTMLElement;

    const nameInput = element.querySelector<HTMLInputElement>('input[formControlName="name"]');

    const categorySelect = element.querySelector<HTMLSelectElement>(
      'select[formControlName="category"]',
    );

    const favoriteInput = element.querySelector<HTMLInputElement>(
      'input[formControlName="favorite"]',
    );

    expect(nameInput?.value).toBe('Black Blazer');
    expect(categorySelect?.value).toBe('outerwear');
    expect(favoriteInput?.checked).toBe(true);
  });

  it('should use empty fallback values for missing optional item fields', () => {
    const itemWithoutOptionalFields = {
      _id: 'item-2',
      name: 'Basic Top',
      category: 'tops',
    } as ClothingItem;

    fixture.componentRef.setInput('initialItem', itemWithoutOptionalFields);
    fixture.detectChanges();

    expect(component.itemForm.getRawValue()).toEqual({
      name: 'Basic Top',
      category: 'tops',
      brand: '',
      color: '',
      size: '',
      imageUrl: '',
      notes: '',
      favorite: false,
    });
  });

  it('should mark all controls as touched and not emit when the form is invalid', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.submitForm();
    fixture.detectChanges();

    const nameControl = component.itemForm.controls.name;
    const categoryControl = component.itemForm.controls.category;

    const element = fixture.nativeElement as HTMLElement;
    const errorElements = element.querySelectorAll('.archive-form__error');

    const errorMessages = Array.from(errorElements).map((error) => error.textContent?.trim());

    expect(component.itemForm.invalid).toBe(true);

    expect(nameControl.touched).toBe(true);
    expect(nameControl.hasError('required')).toBe(true);

    expect(categoryControl.touched).toBe(true);
    expect(categoryControl.hasError('required')).toBe(true);

    expect(errorMessages).toContain('Name is required.');
    expect(errorMessages).toContain('Category is required.');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should validate the maximum field lengths', () => {
    component.itemForm.setValue({
      name: 'a'.repeat(101),
      category: 'tops',
      brand: 'b'.repeat(101),
      color: 'c'.repeat(51),
      size: 'd'.repeat(21),
      imageUrl: '',
      notes: 'e'.repeat(501),
      favorite: false,
    });

    expect(component.itemForm.controls.name.hasError('maxlength')).toBe(true);
    expect(component.itemForm.controls.brand.hasError('maxlength')).toBe(true);
    expect(component.itemForm.controls.color.hasError('maxlength')).toBe(true);
    expect(component.itemForm.controls.size.hasError('maxlength')).toBe(true);
    expect(component.itemForm.controls.notes.hasError('maxlength')).toBe(true);
    expect(component.itemForm.invalid).toBe(true);
  });

  it('should emit a trimmed payload containing all populated optional fields', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.itemForm.setValue({
      name: '  Black Blazer  ',
      category: 'outerwear',
      brand: '  ARKET  ',
      color: '  Black  ',
      size: '  S  ',
      imageUrl: '  /uploads/black-blazer.jpg  ',
      notes: '  Oversized fit.  ',
      favorite: true,
    });

    component.submitForm();

    const expectedPayload: CreateClothingItemRequest = {
      name: 'Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      color: 'Black',
      size: 'S',
      imageUrl: '/uploads/black-blazer.jpg',
      notes: 'Oversized fit.',
      favorite: true,
    };

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('should omit empty optional fields from the emitted payload', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.itemForm.setValue({
      name: '  Minimal Top  ',
      category: 'tops',
      brand: '   ',
      color: '',
      size: '   ',
      imageUrl: '',
      notes: '   ',
      favorite: false,
    });

    component.submitForm();

    const expectedPayload: CreateClothingItemRequest = {
      name: 'Minimal Top',
      category: 'tops',
      favorite: false,
    };

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(expectedPayload);

    const emittedPayload = emitSpy.mock.calls[0][0];

    expect(emittedPayload).not.toHaveProperty('brand');
    expect(emittedPayload).not.toHaveProperty('color');
    expect(emittedPayload).not.toHaveProperty('size');
    expect(emittedPayload).not.toHaveProperty('imageUrl');
    expect(emittedPayload).not.toHaveProperty('notes');
  });

  it('should submit the form through the template', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.itemForm.patchValue({
      name: 'Silver Bag',
      category: 'bags',
    });

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector<HTMLFormElement>('form');

    form?.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(emitSpy).toHaveBeenCalledTimes(1);

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Silver Bag',
      category: 'bags',
      favorite: false,
    });
  });
});
