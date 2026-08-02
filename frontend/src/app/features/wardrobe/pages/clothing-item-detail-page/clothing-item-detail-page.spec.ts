import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClothingItemDetailPage } from './clothing-item-detail-page';
import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

describe('ClothingItemDetailPage', () => {
  let fixture: ComponentFixture<ClothingItemDetailPage>;
  let component: ClothingItemDetailPage;

  let routeId: string | null;
  let returnTo: string | null;

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

  const clothingItemServiceMock = {
    getItemById: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      get paramMap() {
        return convertToParamMap(routeId ? { id: routeId } : {});
      },

      get queryParamMap() {
        return convertToParamMap(returnTo ? { returnTo } : {});
      },
    },
  };

  beforeEach(async () => {
    routeId = 'item-1';
    returnTo = null;

    clothingItemServiceMock.getItemById.mockReset();
    clothingItemServiceMock.getItemById.mockReturnValue(of(mockItem));

    await TestBed.configureTestingModule({
      imports: [ClothingItemDetailPage],
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
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ClothingItemDetailPage);
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
    expect(component.errorMessage()).toBeNull();

    expect(component.backLink()).toBe('/');
    expect(component.backLabel()).toBe('Back to archive');
  });

  it('should display the loading state while the item is loading', () => {
    const itemSubject = new Subject<ClothingItem>();

    clothingItemServiceMock.getItemById.mockReturnValue(itemSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading item...');

    expect(element.querySelector('.detail-page__content')).toBeNull();

    itemSubject.next(mockItem);
    itemSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading item...');
    expect(element.textContent).toContain('Black Blazer');

    expect(element.querySelector('.detail-page__content')).not.toBeNull();
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

    expect(element.querySelector('.detail-page__edit-link')).toBeNull();

    expect(element.querySelector('.detail-page__content')).toBeNull();
  });

  it('should display an error when the item cannot be loaded', () => {
    clothingItemServiceMock.getItemById.mockReturnValue(throwError(() => new Error('Load failed')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.item()).toBeNull();
    expect(component.isLoading()).toBe(false);

    expect(component.errorMessage()).toBe('Item could not be loaded.');

    expect(element.textContent).toContain('Item could not be loaded.');

    expect(element.querySelector('.detail-page__content')).toBeNull();
  });

  it('should render all item details', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Black Blazer');

    expect(element.querySelector('.detail-page__eyebrow')?.textContent?.trim()).toBe('outerwear');

    expect(element.textContent).toContain('Brand');
    expect(element.textContent).toContain('ARKET');

    expect(element.textContent).toContain('Color');
    expect(element.textContent).toContain('Black');

    expect(element.textContent).toContain('Size');
    expect(element.textContent).toContain('S');

    expect(element.textContent).toContain('Notes');
    expect(element.textContent).toContain('Oversized fit.');

    expect(element.textContent).toContain('Favorite');
    expect(element.textContent).toContain('Yes');
  });

  it('should render the item image with the correct source and alt text', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const image = element.querySelector<HTMLImageElement>('.detail-page__media img');

    expect(image).not.toBeNull();

    expect(image?.getAttribute('src')).toBe('/uploads/black-blazer.jpg');

    expect(image?.alt).toBe('Black Blazer');
  });

  it('should not render an image when the item has no imageUrl', () => {
    const itemWithoutImage = {
      ...mockItem,
      imageUrl: undefined,
    } as ClothingItem;

    clothingItemServiceMock.getItemById.mockReturnValue(of(itemWithoutImage));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.detail-page__media img')).toBeNull();

    expect(element.querySelector('.detail-page__media')).not.toBeNull();
  });

  it('should not render optional metadata when it is missing', () => {
    const minimalItem = {
      _id: 'item-2',
      name: 'Basic Top',
      category: 'tops',
      favorite: false,
    } as ClothingItem;

    clothingItemServiceMock.getItemById.mockReturnValue(of(minimalItem));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Basic Top');
    expect(element.textContent).toContain('tops');

    expect(element.textContent).not.toContain('Brand');
    expect(element.textContent).not.toContain('Color');
    expect(element.textContent).not.toContain('Size');
    expect(element.textContent).not.toContain('Notes');

    expect(element.textContent).toContain('Favorite');
    expect(element.textContent).toContain('No');
  });

  it('should display a back-to-outfit link for a valid returnTo query parameter', () => {
    returnTo = '/outfits/outfit-1';

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const contextLink = element.querySelector<HTMLAnchorElement>('.detail-page__context-link');

    expect(component.backLink()).toBe('/outfits/outfit-1');

    expect(component.backLabel()).toBe('Back to outfit');

    expect(contextLink).not.toBeNull();

    expect(contextLink?.textContent?.trim()).toBe('Back to outfit');

    expect(contextLink?.getAttribute('href')).toBe('/outfits/outfit-1');
  });

  it('should ignore an external returnTo URL', () => {
    returnTo = 'https://malicious.example/outfits/outfit-1';

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.backLink()).toBe('/');
    expect(component.backLabel()).toBe('Back to archive');

    expect(element.querySelector('.detail-page__context-link')).toBeNull();
  });
});
