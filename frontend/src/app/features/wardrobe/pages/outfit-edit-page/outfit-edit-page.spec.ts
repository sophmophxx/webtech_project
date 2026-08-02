import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OutfitEditPage } from './outfit-edit-page';
import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { OutfitService, UpdateOutfitRequest } from '../../../../core/services/outfit.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { Outfit } from '../../../../shared/models/outfit.model';

describe('OutfitEditPage', () => {
  let fixture: ComponentFixture<OutfitEditPage>;
  let component: OutfitEditPage;
  let router: Router;
  let routeId: string | null;

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

  const mockOutfit = {
    _id: 'outfit-1',
    name: 'Gallery Evening',
    notes: 'Black tailoring with silver accessories.',
    favorite: true,
    items: [mockItems[0]],
  } as Outfit;

  const updatedOutfit = {
    ...mockOutfit,
    name: 'Updated Gallery Evening',
    items: mockItems,
  } as Outfit;

  const clothingItemServiceMock = {
    getItems: vi.fn(),
  };

  const outfitServiceMock = {
    getOutfitById: vi.fn(),
    updateOutfit: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      get paramMap() {
        return convertToParamMap(routeId ? { id: routeId } : {});
      },
    },
  };

  beforeEach(async () => {
    routeId = 'outfit-1';

    clothingItemServiceMock.getItems.mockReset();
    outfitServiceMock.getOutfitById.mockReset();
    outfitServiceMock.updateOutfit.mockReset();

    clothingItemServiceMock.getItems.mockReturnValue(of(mockItems));
    outfitServiceMock.getOutfitById.mockReturnValue(of(mockOutfit));
    outfitServiceMock.updateOutfit.mockReturnValue(of(updatedOutfit));

    await TestBed.configureTestingModule({
      imports: [OutfitEditPage],
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
    fixture = TestBed.createComponent(OutfitEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component and load the editor data', () => {
    createComponent();

    expect(component).toBeTruthy();

    expect(outfitServiceMock.getOutfitById).toHaveBeenCalledTimes(1);
    expect(outfitServiceMock.getOutfitById).toHaveBeenCalledWith('outfit-1');

    expect(clothingItemServiceMock.getItems).toHaveBeenCalledTimes(1);

    expect(component.outfit()).toEqual(mockOutfit);
    expect(component.items()).toEqual(mockItems);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should prefill the form and existing item selection', () => {
    createComponent();

    expect(component.outfitForm.getRawValue()).toEqual({
      name: 'Gallery Evening',
      notes: 'Black tailoring with silver accessories.',
      favorite: true,
    });

    expect(component.selectedItemIds()).toEqual(new Set(['item-1']));
    expect(component.isSelected('item-1')).toBe(true);
    expect(component.isSelected('item-2')).toBe(false);
  });

  it('should use default values when notes and favorite are missing', () => {
    const outfitWithoutOptionalValues = {
      ...mockOutfit,
      notes: undefined,
      favorite: undefined,
    } as Outfit;

    outfitServiceMock.getOutfitById.mockReturnValue(of(outfitWithoutOptionalValues));

    createComponent();

    expect(component.outfitForm.getRawValue()).toEqual({
      name: 'Gallery Evening',
      notes: '',
      favorite: false,
    });
  });

  it('should display the loading state while both requests are pending', () => {
    const outfitSubject = new Subject<Outfit>();
    const itemsSubject = new Subject<ClothingItem[]>();

    outfitServiceMock.getOutfitById.mockReturnValue(outfitSubject.asObservable());

    clothingItemServiceMock.getItems.mockReturnValue(itemsSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading outfit...');

    outfitSubject.next(mockOutfit);
    outfitSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading outfit...');

    itemsSubject.next(mockItems);
    itemsSubject.complete();

    fixture.detectChanges();

    const nameInput = element.querySelector<HTMLInputElement>('input[formControlName="name"]');

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading outfit...');
    expect(nameInput?.value).toBe('Gallery Evening');
    expect(element.textContent).toContain('Black Blazer');
  });

  it('should display an error when no outfit id is present', () => {
    routeId = null;

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(outfitServiceMock.getOutfitById).not.toHaveBeenCalled();
    expect(clothingItemServiceMock.getItems).not.toHaveBeenCalled();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('No outfit id found.');
    expect(element.textContent).toContain('No outfit id found.');
  });

  it('should display an error when the editor data cannot be loaded', () => {
    outfitServiceMock.getOutfitById.mockReturnValue(throwError(() => new Error('API error')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.outfit()).toBeNull();
    expect(component.isLoading()).toBe(false);

    expect(component.errorMessage()).toBe('Outfit could not be loaded.');

    expect(element.textContent).toContain('Outfit could not be loaded.');
  });

  it('should render the outfit, available items and navigation links', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const itemButtons = element.querySelectorAll('.outfit-piece');

    const backLink = element.querySelector<HTMLAnchorElement>('.outfit-create-page__nav-link');

    const cancelLink = element.querySelector<HTMLAnchorElement>('.outfit-builder__actions a');

    expect(element.querySelector('h1')?.textContent).toContain('Edit Outfit');

    expect(itemButtons.length).toBe(2);
    expect(element.textContent).toContain('Black Blazer');
    expect(element.textContent).toContain('Wide Leg Trousers');
    expect(element.textContent).toContain('ARKET');
    expect(element.textContent).toContain('1 selected');

    expect(backLink?.textContent?.trim()).toBe('Back to outfit');
    expect(backLink?.getAttribute('href')).toContain('/outfits/outfit-1');

    expect(cancelLink?.textContent?.trim()).toBe('Cancel');
    expect(cancelLink?.getAttribute('href')).toContain('/outfits/outfit-1');
  });

  it('should add and remove items from the selection', () => {
    createComponent();

    component.selectionError.set('Previous error');

    component.toggleItemSelection('item-2');

    expect(component.isSelected('item-2')).toBe(true);
    expect(component.selectedItemIds()).toEqual(new Set(['item-1', 'item-2']));

    expect(component.selectionError()).toBeNull();

    component.toggleItemSelection('item-1');

    expect(component.isSelected('item-1')).toBe(false);
    expect(component.selectedItemIds()).toEqual(new Set(['item-2']));
  });

  it('should mark the form as touched when the name is invalid', () => {
    createComponent();

    component.outfitForm.controls.name.setValue('');

    component.updateOutfit();
    fixture.detectChanges();

    const nameControl = component.outfitForm.controls.name;
    const element = fixture.nativeElement as HTMLElement;

    expect(nameControl.touched).toBe(true);
    expect(nameControl.hasError('required')).toBe(true);

    expect(element.textContent).toContain('Name is required.');
    expect(outfitServiceMock.updateOutfit).not.toHaveBeenCalled();
  });

  it('should reject values exceeding the maximum form lengths', () => {
    createComponent();

    component.outfitForm.controls.name.setValue('a'.repeat(101));
    component.outfitForm.controls.notes.setValue('b'.repeat(501));

    expect(component.outfitForm.controls.name.hasError('maxlength')).toBe(true);

    expect(component.outfitForm.controls.notes.hasError('maxlength')).toBe(true);

    expect(component.outfitForm.invalid).toBe(true);

    component.updateOutfit();

    expect(outfitServiceMock.updateOutfit).not.toHaveBeenCalled();
  });

  it('should require at least one selected clothing item', () => {
    createComponent();

    component.selectedItemIds.set(new Set());

    component.updateOutfit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.selectionError()).toBe('Select at least one piece for this outfit.');

    expect(element.textContent).toContain('Select at least one piece for this outfit.');

    expect(component.isSubmitting()).toBe(false);
    expect(outfitServiceMock.updateOutfit).not.toHaveBeenCalled();
  });

  it('should update the outfit with trimmed form values', () => {
    createComponent();

    component.outfitForm.setValue({
      name: '  Updated Gallery Evening  ',
      notes: '  Updated styling notes  ',
      favorite: false,
    });

    component.toggleItemSelection('item-2');

    component.updateOutfit();

    const expectedPayload: UpdateOutfitRequest = {
      name: 'Updated Gallery Evening',
      notes: 'Updated styling notes',
      items: ['item-1', 'item-2'],
      favorite: false,
    };

    expect(outfitServiceMock.updateOutfit).toHaveBeenCalledTimes(1);

    expect(outfitServiceMock.updateOutfit).toHaveBeenCalledWith('outfit-1', expectedPayload);

    expect(router.navigate).toHaveBeenCalledWith(['/outfits', updatedOutfit._id]);
  });

  it('should include an empty notes string in the update payload', () => {
    createComponent();

    component.outfitForm.setValue({
      name: 'Minimal Outfit',
      notes: '   ',
      favorite: true,
    });

    component.updateOutfit();

    expect(outfitServiceMock.updateOutfit).toHaveBeenCalledWith('outfit-1', {
      name: 'Minimal Outfit',
      notes: '',
      items: ['item-1'],
      favorite: true,
    });
  });

  it('should display the submitting state while the request is pending', () => {
    const updateSubject = new Subject<Outfit>();

    outfitServiceMock.updateOutfit.mockReturnValue(updateSubject.asObservable());

    createComponent();

    component.updateOutfit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const submitButton = element.querySelector<HTMLButtonElement>('.outfit-builder__submit');

    expect(component.isSubmitting()).toBe(true);
    expect(submitButton?.disabled).toBe(true);
    expect(submitButton?.textContent?.trim()).toBe('Saving...');

    updateSubject.next(updatedOutfit);
    updateSubject.complete();
  });

  it('should handle an error when the outfit cannot be updated', () => {
    outfitServiceMock.updateOutfit.mockReturnValue(throwError(() => new Error('Update failed')));

    createComponent();

    component.updateOutfit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.errorMessage()).toBe('Outfit could not be updated.');

    expect(component.isSubmitting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();

    expect(element.textContent).toContain('Outfit could not be updated.');
  });
});
