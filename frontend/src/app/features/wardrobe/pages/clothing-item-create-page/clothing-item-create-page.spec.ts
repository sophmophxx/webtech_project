import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClothingItemCreatePage } from './clothing-item-create-page';
import {
  ClothingItemService,
  CreateClothingItemRequest,
} from '../../../../core/services/clothing-item.service';
import { ClothingItemForm } from '../../components/clothing-item-form/clothing-item-form';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

describe('ClothingItemCreatePage', () => {
  let fixture: ComponentFixture<ClothingItemCreatePage>;
  let component: ClothingItemCreatePage;
  let router: Router;

  const payload: CreateClothingItemRequest = {
    name: 'Black Blazer',
    category: 'outerwear',
    brand: 'ARKET',
    color: 'Black',
    size: 'S',
    imageUrl: '/uploads/black-blazer.jpg',
    notes: 'Oversized fit.',
    favorite: true,
  };

  const createdItem = {
    _id: 'item-1',
    ...payload,
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  } as ClothingItem;

  const clothingItemServiceMock = {
    createItem: vi.fn(),
  };

  beforeEach(async () => {
    clothingItemServiceMock.createItem.mockReset();
    clothingItemServiceMock.createItem.mockReturnValue(of(createdItem));

    await TestBed.configureTestingModule({
      imports: [ClothingItemCreatePage],
      providers: [
        provideRouter([]),
        {
          provide: ClothingItemService,
          useValue: clothingItemServiceMock,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ClothingItemCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an item and navigate to the wardrobe overview', () => {
    component.createItem(payload);

    expect(clothingItemServiceMock.createItem).toHaveBeenCalledTimes(1);
    expect(clothingItemServiceMock.createItem).toHaveBeenCalledWith(payload);

    expect(component.isSubmitting()).toBe(true);
    expect(component.errorMessage()).toBeNull();

    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set the submitting state while the request is pending', () => {
    const createSubject = new Subject<ClothingItem>();

    clothingItemServiceMock.createItem.mockReturnValue(createSubject.asObservable());

    component.createItem(payload);

    expect(component.isSubmitting()).toBe(true);
    expect(component.errorMessage()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();

    createSubject.next(createdItem);
    createSubject.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle an error when the item cannot be created', () => {
    clothingItemServiceMock.createItem.mockReturnValue(
      throwError(() => new Error('Creation failed')),
    );

    component.createItem(payload);

    expect(clothingItemServiceMock.createItem).toHaveBeenCalledWith(payload);

    expect(component.errorMessage()).toBe('Item could not be created.');

    expect(component.isSubmitting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should submit an item when the child form emits formSubmit', () => {
    const formDebugElement = fixture.debugElement.query(By.directive(ClothingItemForm));

    const formComponent = formDebugElement.componentInstance as ClothingItemForm;

    formComponent.formSubmit.emit(payload);

    expect(clothingItemServiceMock.createItem).toHaveBeenCalledTimes(1);
    expect(clothingItemServiceMock.createItem).toHaveBeenCalledWith(payload);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
