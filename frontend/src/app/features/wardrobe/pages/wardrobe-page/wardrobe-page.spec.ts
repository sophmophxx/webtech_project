import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WardrobePage } from './wardrobe-page';
import { ClothingItemService } from '../../../../core/services/clothing-item.service';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';
import { ClothingItemCard } from '../../components/clothing-item-card/clothing-item-card';

describe('WardrobePage', () => {
  let fixture: ComponentFixture<WardrobePage>;
  let component: WardrobePage;

  const mockItems = [
    {
      _id: 'item-1',
      name: 'Black Blazer',
      category: 'outerwear',
      brand: 'ARKET',
      color: 'Black',
      size: 'S',
      imageUrl: '/uploads/black-blazer.jpg',
      notes: 'Oversized fit.',
      favorite: true,
    },
    {
      _id: 'item-2',
      name: 'Wide Leg Trousers',
      category: 'bottoms',
      brand: 'COS',
      color: 'Black',
      size: '36',
      favorite: false,
    },
  ] as ClothingItem[];

  const clothingItemServiceMock = {
    getItems: vi.fn(),
  };

  beforeEach(async () => {
    clothingItemServiceMock.getItems.mockReset();

    clothingItemServiceMock.getItems.mockReturnValue(of(mockItems));

    await TestBed.configureTestingModule({
      imports: [WardrobePage],
      providers: [
        provideRouter([]),
        {
          provide: ClothingItemService,
          useValue: clothingItemServiceMock,
        },
      ],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(WardrobePage);
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

  it('should display the loading state while items are loading', () => {
    const itemsSubject = new Subject<ClothingItem[]>();

    clothingItemServiceMock.getItems.mockReturnValue(itemsSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading items...');
    expect(element.querySelector('.wardrobe-page__grid')).toBeNull();

    itemsSubject.next(mockItems);
    itemsSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading items...');

    const cards = element.querySelectorAll('app-clothing-item-card');

    expect(cards.length).toBe(2);
  });

  it('should display an error when clothing items cannot be loaded', () => {
    clothingItemServiceMock.getItems.mockReturnValue(throwError(() => new Error('API error')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const errorState = element.querySelector('.wardrobe-page__state--error');

    expect(component.items()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Items could not be loaded.');

    expect(errorState).not.toBeNull();
    expect(errorState?.textContent).toContain('Items could not be loaded.');

    expect(element.querySelector('.wardrobe-page__grid')).toBeNull();
  });

  it('should display the empty state when no items exist', () => {
    clothingItemServiceMock.getItems.mockReturnValue(of([]));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.items()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();

    expect(element.textContent).toContain('No items yet.');
    expect(element.querySelector('.wardrobe-page__grid')).toBeNull();
  });

  it('should render one clothing item card for each loaded item', () => {
    createComponent();

    const cardDebugElements = fixture.debugElement.queryAll(By.directive(ClothingItemCard));

    expect(cardDebugElements.length).toBe(2);

    const firstCard = cardDebugElements[0].componentInstance as ClothingItemCard;

    const secondCard = cardDebugElements[1].componentInstance as ClothingItemCard;

    expect(firstCard.item).toEqual(mockItems[0]);
    expect(secondCard.item).toEqual(mockItems[1]);
  });

  it('should render the page navigation links', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const archiveLink = element.querySelector<HTMLAnchorElement>(
      '.wardrobe-page__nav-link[href="/"]',
    );

    const outfitsLink = element.querySelector<HTMLAnchorElement>(
      '.wardrobe-page__nav-link[href="/outfits"]',
    );

    const addItemLink = element.querySelector<HTMLAnchorElement>('.wardrobe-page__new-link');

    expect(archiveLink?.textContent?.trim()).toBe('Archive');
    expect(outfitsLink?.textContent?.trim()).toBe('Outfits');

    expect(addItemLink?.textContent?.trim()).toBe('Add item');
    expect(addItemLink?.getAttribute('href')).toBe('/items/new');
  });
});
