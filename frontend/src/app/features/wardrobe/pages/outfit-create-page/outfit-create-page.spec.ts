import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OutfitCreatePage } from './outfit-create-page';
import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { CreateOutfitRequest, OutfitService } from '../../../../core/services/outfit.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

describe('OutfitCreatePage', () => {
  let fixture: ComponentFixture<OutfitCreatePage>;
  let component: OutfitCreatePage;
  let router: Router;

  const mockItems = [
    {
      _id: 'item-1',
      name: 'Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      imageUrl: 'https://example.com/blazer.jpg',
      favorite: false,
    },
    {
      _id: 'item-2',
      name: 'Wide Leg Trousers',
      category: 'bottoms',
      favorite: false,
    },
  ] as ClothingItem[];

  const clothingItemServiceMock = {
    getItems: vi.fn(),
  };

  const outfitServiceMock = {
    createOutfit: vi.fn(),
  };

  beforeEach(async () => {
    clothingItemServiceMock.getItems.mockReset();
    outfitServiceMock.createOutfit.mockReset();

    clothingItemServiceMock.getItems.mockReturnValue(of(mockItems));
    outfitServiceMock.createOutfit.mockReturnValue(
      of({
        _id: 'outfit-1',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [OutfitCreatePage],
      providers: [
        provideRouter([]),
        {
          provide: ClothingItemService,
          useValue: clothingItemServiceMock,
        },
        {
          provide: OutfitService,
          useValue: outfitServiceMock,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(OutfitCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component and load clothing items', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(clothingItemServiceMock.getItems).toHaveBeenCalledTimes(1);
    expect(component.items()).toEqual(mockItems);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should display the loading state while clothing items are loading', () => {
    const itemsSubject = new Subject<ClothingItem[]>();

    clothingItemServiceMock.getItems.mockReturnValue(itemsSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading pieces...');

    itemsSubject.next(mockItems);
    itemsSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading pieces...');
    expect(element.textContent).toContain('Black Blazer');
  });

  it('should display an error when clothing items cannot be loaded', () => {
    clothingItemServiceMock.getItems.mockReturnValue(throwError(() => new Error('API error')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(false);
    expect(component.items()).toEqual([]);
    expect(component.errorMessage()).toBe('Items could not be loaded.');
    expect(element.textContent).toContain('Items could not be loaded.');
  });

  it('should render all loaded clothing items', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const itemButtons = element.querySelectorAll('.outfit-piece');
    const image = element.querySelector<HTMLImageElement>('.outfit-piece__media img');

    expect(itemButtons.length).toBe(2);
    expect(element.textContent).toContain('Black Blazer');
    expect(element.textContent).toContain('Wide Leg Trousers');
    expect(element.textContent).toContain('ARKET');

    expect(image?.src).toBe('https://example.com/blazer.jpg');
    expect(image?.alt).toBe('Black Blazer');
  });

  it('should add and remove an item from the selection', () => {
    createComponent();

    component.selectionError.set('Previous selection error');

    expect(component.isSelected('item-1')).toBe(false);

    component.toggleItemSelection('item-1');

    expect(component.isSelected('item-1')).toBe(true);
    expect(component.selectedItemIds().size).toBe(1);
    expect(component.selectionError()).toBeNull();

    component.toggleItemSelection('item-1');

    expect(component.isSelected('item-1')).toBe(false);
    expect(component.selectedItemIds().size).toBe(0);
  });

  it('should mark the form as touched when submitted without a name', () => {
    createComponent();

    component.createOutfit();
    fixture.detectChanges();

    const nameControl = component.outfitForm.controls.name;
    const element = fixture.nativeElement as HTMLElement;
    const errorElement = element.querySelector('.outfit-builder__error');

    expect(nameControl.touched).toBe(true);
    expect(nameControl.hasError('required')).toBe(true);
    expect(errorElement?.textContent).toContain('Name is required.');
    expect(outfitServiceMock.createOutfit).not.toHaveBeenCalled();
  });

  it('should reject values that exceed the maximum form lengths', () => {
    createComponent();

    component.outfitForm.controls.name.setValue('a'.repeat(101));
    component.outfitForm.controls.notes.setValue('b'.repeat(501));

    expect(component.outfitForm.controls.name.hasError('maxlength')).toBe(true);

    expect(component.outfitForm.controls.notes.hasError('maxlength')).toBe(true);

    expect(component.outfitForm.invalid).toBe(true);
  });

  it('should require at least one selected clothing item', () => {
    createComponent();

    component.outfitForm.controls.name.setValue('Evening Look');

    component.createOutfit();

    expect(component.selectionError()).toBe('Select at least one piece for this outfit.');

    expect(component.isSubmitting()).toBe(false);
    expect(outfitServiceMock.createOutfit).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should create an outfit with trimmed form values', () => {
    createComponent();

    component.outfitForm.setValue({
      name: '  Evening Look  ',
      notes: '  Dinner and gallery opening  ',
      favorite: true,
    });

    component.toggleItemSelection('item-1');
    component.toggleItemSelection('item-2');

    component.createOutfit();

    const expectedPayload: CreateOutfitRequest = {
      name: 'Evening Look',
      notes: 'Dinner and gallery opening',
      items: ['item-1', 'item-2'],
      favorite: true,
    };

    expect(outfitServiceMock.createOutfit).toHaveBeenCalledTimes(1);
    expect(outfitServiceMock.createOutfit).toHaveBeenCalledWith(expectedPayload);

    expect(router.navigate).toHaveBeenCalledWith(['/outfits']);
  });

  it('should omit notes from the payload when they are empty', () => {
    createComponent();

    component.outfitForm.setValue({
      name: 'Minimal Look',
      notes: '   ',
      favorite: false,
    });

    component.toggleItemSelection('item-1');

    component.createOutfit();

    expect(outfitServiceMock.createOutfit).toHaveBeenCalledWith({
      name: 'Minimal Look',
      items: ['item-1'],
      favorite: false,
    });

    const payload = outfitServiceMock.createOutfit.mock.calls[0][0] as CreateOutfitRequest;

    expect(payload).not.toHaveProperty('notes');
  });

  it('should display the submitting state while the request is pending', () => {
    const createOutfitSubject = new Subject<unknown>();

    outfitServiceMock.createOutfit.mockReturnValue(createOutfitSubject.asObservable());

    createComponent();

    component.outfitForm.controls.name.setValue('Pending Look');
    component.toggleItemSelection('item-1');

    component.createOutfit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const submitButton = element.querySelector<HTMLButtonElement>('.outfit-builder__submit');

    expect(component.isSubmitting()).toBe(true);
    expect(submitButton?.disabled).toBe(true);
    expect(submitButton?.textContent?.trim()).toBe('Saving...');

    createOutfitSubject.next({});
    createOutfitSubject.complete();
  });

  it('should handle an error when the outfit cannot be created', () => {
    outfitServiceMock.createOutfit.mockReturnValue(throwError(() => new Error('Creation failed')));

    createComponent();

    component.outfitForm.setValue({
      name: 'Failed Look',
      notes: '',
      favorite: false,
    });

    component.toggleItemSelection('item-1');

    component.createOutfit();

    expect(component.errorMessage()).toBe('Outfit could not be created.');

    expect(component.isSubmitting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });
  it('should filter available pieces without clearing the current selection', () => {
    createComponent();

    component.toggleItemSelection('item-1');

    const element = fixture.nativeElement as HTMLElement;
    const bottomsFilter = element.querySelector<HTMLButtonElement>('[data-category="bottoms"]');

    bottomsFilter?.click();
    fixture.detectChanges();

    const itemButtons = element.querySelectorAll('.outfit-piece');

    expect(component.selectedCategory()).toBe('bottoms');
    expect(component.filteredItems()).toEqual([mockItems[1]]);

    // Das ausgefilterte Item bleibt Bestandteil des Outfits.
    expect(component.isSelected('item-1')).toBe(true);
    expect(component.selectedItemIds().size).toBe(1);

    expect(itemButtons.length).toBe(1);
    expect(itemButtons[0].textContent).toContain('Wide Leg Trousers');
  });
});
