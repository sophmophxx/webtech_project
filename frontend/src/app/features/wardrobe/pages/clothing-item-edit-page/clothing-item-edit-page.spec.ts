import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClothingItemEditPage } from './clothing-item-edit-page';
import {
  ClothingItemService,
  CreateClothingItemRequest,
  UpdateClothingItemRequest,
} from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { ClothingItemForm } from '../../components/clothing-item-form/clothing-item-form';

describe('ClothingItemEditPage', () => {
  let fixture: ComponentFixture<ClothingItemEditPage>;
  let component: ClothingItemEditPage;
  let router: Router;
  let routeId: string | null;

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
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
  } as ClothingItem;

  const updatedItem = {
    ...mockItem,
    name: 'Updated Black Blazer',
    color: 'Charcoal',
    favorite: false,
  } as ClothingItem;

  const clothingItemServiceMock = {
    getItemById: vi.fn(),
    updateItem: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      get paramMap() {
        return convertToParamMap(routeId ? { id: routeId } : {});
      },
    },
  };

  beforeEach(async () => {
    routeId = 'item-1';

    clothingItemServiceMock.getItemById.mockReset();
    clothingItemServiceMock.updateItem.mockReset();

    clothingItemServiceMock.getItemById.mockReturnValue(of(mockItem));
    clothingItemServiceMock.updateItem.mockReturnValue(of(updatedItem));

    await TestBed.configureTestingModule({
      imports: [ClothingItemEditPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: ClothingItemService,
          useValue: clothingItemServiceMock,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ClothingItemEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component and load the item from the route id', () => {
    createComponent();

    expect(component).toBeTruthy();

    expect(clothingItemServiceMock.getItemById).toHaveBeenCalledTimes(1);

    expect(clothingItemServiceMock.getItemById).toHaveBeenCalledWith('item-1');

    expect(component.item()).toEqual(mockItem);
    expect(component.isLoading()).toBe(false);
    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should display the loading state while the item is loading', () => {
    const itemSubject = new Subject<ClothingItem>();

    clothingItemServiceMock.getItemById.mockReturnValue(itemSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading item...');

    expect(element.querySelector('app-clothing-item-form')).toBeNull();

    itemSubject.next(mockItem);
    itemSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading item...');

    const nameInput = element.querySelector<HTMLInputElement>('input[formControlName="name"]');

    expect(nameInput?.value).toBe('Black Blazer');
  });

  it('should display an error when no item id is present', () => {
    routeId = null;

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(clothingItemServiceMock.getItemById).not.toHaveBeenCalled();

    expect(component.item()).toBeNull();
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('No item id found.');

    expect(element.textContent).toContain('No item id found.');

    expect(element.querySelector('.editor-page__back-link[href]')).toBeNull();

    expect(element.querySelector('app-clothing-item-form')).toBeNull();
  });

  it('should display an error when the item cannot be loaded', () => {
    clothingItemServiceMock.getItemById.mockReturnValue(throwError(() => new Error('Load failed')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.item()).toBeNull();
    expect(component.isLoading()).toBe(false);

    expect(component.errorMessage()).toBe('Item could not be loaded.');

    expect(element.textContent).toContain('Item could not be loaded.');

    expect(element.querySelector('app-clothing-item-form')).toBeNull();
  });

  it('should render the loaded item in the clothing item form', () => {
    createComponent();

    const formDebugElement = fixture.debugElement.query(By.directive(ClothingItemForm));

    expect(formDebugElement).not.toBeNull();

    const formComponent = formDebugElement.componentInstance as ClothingItemForm;

    expect(formComponent.initialItem).toEqual(mockItem);
    expect(formComponent.submitButtonLabel).toBe('Save changes');

    expect(formComponent.itemForm.getRawValue()).toEqual({
      name: 'Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      color: 'Black',
      size: 'S',
      imageUrl: '/uploads/black-blazer.jpg',
      notes: 'Oversized fit.',
      favorite: true,
    });
  });

  it('should render the back link for the loaded item', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const backLink = element.querySelector<HTMLAnchorElement>('.editor-page__back-link');

    expect(backLink?.textContent?.trim()).toBe('Back to item');
    expect(backLink?.getAttribute('href')).toBe('/items/item-1');
  });

  it('should update the item and navigate to its detail page', () => {
    createComponent();

    const payload: UpdateClothingItemRequest = {
      name: 'Updated Black Blazer',
      color: 'Charcoal',
      favorite: false,
    };

    component.updateItem(payload);

    expect(clothingItemServiceMock.updateItem).toHaveBeenCalledTimes(1);

    expect(clothingItemServiceMock.updateItem).toHaveBeenCalledWith('item-1', payload);

    expect(component.isSubmitting()).toBe(true);
    expect(component.errorMessage()).toBeNull();

    expect(router.navigate).toHaveBeenCalledWith(['/items', updatedItem._id]);
  });

  it('should display the submitting state while the request is pending', () => {
    const updateSubject = new Subject<ClothingItem>();

    clothingItemServiceMock.updateItem.mockReturnValue(updateSubject.asObservable());

    createComponent();

    const payload: UpdateClothingItemRequest = {
      name: 'Updated Black Blazer',
    };

    component.updateItem(payload);

    expect(component.isSubmitting()).toBe(true);
    expect(component.errorMessage()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();

    updateSubject.next(updatedItem);
    updateSubject.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/items', 'item-1']);
  });

  it('should handle an error when the item cannot be updated', () => {
    clothingItemServiceMock.updateItem.mockReturnValue(
      throwError(() => new Error('Update failed')),
    );

    createComponent();

    const payload: UpdateClothingItemRequest = {
      name: 'Updated Black Blazer',
    };

    component.updateItem(payload);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(clothingItemServiceMock.updateItem).toHaveBeenCalledWith('item-1', payload);

    expect(component.errorMessage()).toBe('Item could not be updated.');

    expect(component.isSubmitting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();

    expect(element.textContent).toContain('Item could not be updated.');

    expect(element.querySelector('.editor-page__state--error')).not.toBeNull();
  });

  it('should update the item when the child form emits formSubmit', () => {
    createComponent();

    const payload: CreateClothingItemRequest = {
      name: 'Updated Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      color: 'Charcoal',
      size: 'S',
      imageUrl: '/uploads/black-blazer.jpg',
      notes: 'Updated notes.',
      favorite: false,
    };

    const formDebugElement = fixture.debugElement.query(By.directive(ClothingItemForm));

    const formComponent = formDebugElement.componentInstance as ClothingItemForm;

    formComponent.formSubmit.emit(payload);

    expect(clothingItemServiceMock.updateItem).toHaveBeenCalledTimes(1);

    expect(clothingItemServiceMock.updateItem).toHaveBeenCalledWith('item-1', payload);

    expect(router.navigate).toHaveBeenCalledWith(['/items', updatedItem._id]);
  });
});
