import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OutfitsPage } from './outfits-page';
import { OutfitService } from '../../../../core/services/outfit.service';
import { Outfit } from '../../../../shared/models/outfit.model';

describe('OutfitsPage', () => {
  let fixture: ComponentFixture<OutfitsPage>;
  let component: OutfitsPage;

  const mockItems = [
    {
      _id: 'item-1',
      name: 'Black Blazer',
      category: 'outerwear',
      imageUrl: 'https://example.com/blazer.jpg',
      favorite: false,
    },
    {
      _id: 'item-2',
      name: 'Wide Leg Trousers',
      category: 'bottoms',
      imageUrl: 'https://example.com/trousers.jpg',
      favorite: false,
    },
    {
      _id: 'item-3',
      name: 'Silver Bag',
      category: 'bags',
      favorite: false,
    },
    {
      _id: 'item-4',
      name: 'Black Boots',
      category: 'shoes',
      imageUrl: 'https://example.com/boots.jpg',
      favorite: false,
    },
    {
      _id: 'item-5',
      name: 'Long Coat',
      category: 'outerwear',
      imageUrl: 'https://example.com/coat.jpg',
      favorite: false,
    },
  ];

  const singlePieceOutfit = {
    _id: 'outfit-1',
    name: 'Minimal Look',
    notes: 'Simple and clean.',
    favorite: false,
    items: [mockItems[0]],
  } as Outfit;

  const twoPieceOutfit = {
    _id: 'outfit-2',
    name: 'Tailored Look',
    notes: 'Black tailoring.',
    favorite: true,
    items: [mockItems[0], mockItems[1]],
  } as Outfit;

  const manyPieceOutfit = {
    _id: 'outfit-3',
    name: 'Complete Evening Look',
    favorite: false,
    items: mockItems,
  } as Outfit;

  const emptyOutfit = {
    _id: 'outfit-empty',
    name: 'Empty Outfit',
    notes: 'Should not be displayed.',
    favorite: false,
    items: [],
  } as Outfit;

  const mockOutfits = [singlePieceOutfit, twoPieceOutfit, manyPieceOutfit, emptyOutfit];

  const outfitServiceMock = {
    getOutfits: vi.fn(),
  };

  beforeEach(async () => {
    outfitServiceMock.getOutfits.mockReset();
    outfitServiceMock.getOutfits.mockReturnValue(of(mockOutfits));

    await TestBed.configureTestingModule({
      imports: [OutfitsPage],
      providers: [
        provideRouter([]),
        {
          provide: OutfitService,
          useValue: outfitServiceMock,
        },
      ],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(OutfitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component and load saved outfits', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(outfitServiceMock.getOutfits).toHaveBeenCalledTimes(1);

    expect(component.outfits()).toEqual([singlePieceOutfit, twoPieceOutfit, manyPieceOutfit]);

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should display the loading state while outfits are loading', () => {
    const outfitsSubject = new Subject<Outfit[]>();

    outfitServiceMock.getOutfits.mockReturnValue(outfitsSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading outfits...');
    expect(element.querySelector('.outfits-page__grid')).toBeNull();

    outfitsSubject.next(mockOutfits);
    outfitsSubject.complete();

    fixture.detectChanges();

    const outfitCards = element.querySelectorAll('.outfit-card');

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading outfits...');
    expect(outfitCards.length).toBe(3);
  });

  it('should display an error when outfits cannot be loaded', () => {
    outfitServiceMock.getOutfits.mockReturnValue(throwError(() => new Error('API error')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.outfits()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Outfits could not be loaded.');

    expect(element.textContent).toContain('Outfits could not be loaded.');

    expect(element.querySelector('.outfits-page__grid')).toBeNull();
    expect(element.querySelector('.outfits-page__empty')).toBeNull();
  });

  it('should display the empty state when no outfits are available', () => {
    outfitServiceMock.getOutfits.mockReturnValue(of([]));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const emptyState = element.querySelector('.outfits-page__empty');

    const createLink = emptyState?.querySelector<HTMLAnchorElement>('a');

    expect(component.outfits()).toEqual([]);
    expect(component.isLoading()).toBe(false);

    expect(emptyState?.textContent).toContain('No outfits yet.');
    expect(createLink?.textContent?.trim()).toBe('Create your first outfit');

    expect(createLink?.getAttribute('href')).toBe('/outfits/new');
  });

  it('should display the empty state when all loaded outfits are empty', () => {
    outfitServiceMock.getOutfits.mockReturnValue(of([emptyOutfit]));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.outfits()).toEqual([]);
    expect(element.querySelector('.outfits-page__empty')).not.toBeNull();
    expect(element.querySelector('.outfit-card')).toBeNull();
  });

  it('should render one card for every non-empty outfit', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll<HTMLAnchorElement>('.outfit-card');

    expect(cards.length).toBe(3);

    expect(cards[0].getAttribute('href')).toBe('/outfits/outfit-1');
    expect(cards[1].getAttribute('href')).toBe('/outfits/outfit-2');
    expect(cards[2].getAttribute('href')).toBe('/outfits/outfit-3');

    expect(cards[0].textContent).toContain('Minimal Look');
    expect(cards[1].textContent).toContain('Tailored Look');
    expect(cards[2].textContent).toContain('Complete Evening Look');

    expect(element.textContent).not.toContain('Empty Outfit');
    expect(element.textContent).not.toContain('Should not be displayed.');
  });

  it('should display outfit notes only when they are available', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.outfit-card');

    expect(cards[0].textContent).toContain('Simple and clean.');
    expect(cards[1].textContent).toContain('Black tailoring.');

    expect(cards[2].querySelector('.outfit-card__notes')).toBeNull();
  });

  it('should render an empty preview slot when an item has no image', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.outfit-card');

    const thirdCardPreviewSlots = cards[2].querySelectorAll('.outfit-card__image');

    const thirdCardImages = cards[2].querySelectorAll('.outfit-card__image img');

    expect(thirdCardPreviewSlots.length).toBe(4);
    expect(thirdCardImages.length).toBe(3);
  });

  it('should show at most four items in an outfit preview', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.outfit-card');

    const previewSlots = cards[2].querySelectorAll('.outfit-card__image');

    expect(manyPieceOutfit.items.length).toBe(5);
    expect(previewSlots.length).toBe(4);

    expect(cards[2].textContent).toContain('5 pieces');
  });

  it('should render the create outfit navigation link', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const createLink = element.querySelector<HTMLAnchorElement>('.outfits-page__new-link');

    expect(createLink?.textContent?.trim()).toBe('Create outfit');
    expect(createLink?.getAttribute('href')).toBe('/outfits/new');
  });
});
