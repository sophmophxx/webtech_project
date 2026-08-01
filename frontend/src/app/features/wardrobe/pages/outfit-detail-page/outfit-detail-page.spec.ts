import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OutfitDetailPage } from './outfit-detail-page';
import { OutfitService } from '../../../../core/services/outfit.service';
import { Outfit } from '../../../../shared/models/outfit.model';

describe('OutfitDetailPage', () => {
  let fixture: ComponentFixture<OutfitDetailPage>;
  let component: OutfitDetailPage;
  let router: Router;
  let routeId: string | null;

  const mockOutfit = {
    _id: 'outfit-1',
    name: 'Gallery Evening',
    notes: 'Black tailoring with silver accessories.',
    favorite: true,
    items: [
      {
        _id: 'item-1',
        name: 'Black Blazer',
        category: 'outerwear',
        brand: 'ARKET',
        color: 'Black',
        size: 'S',
        imageUrl: 'https://example.com/blazer.jpg',
        favorite: false,
      },
      {
        _id: 'item-2',
        name: 'Wide Leg Trousers',
        category: 'bottoms',
        favorite: false,
      },
    ],
  } as Outfit;

  const outfitServiceMock = {
    getOutfitById: vi.fn(),
    deleteOutfit: vi.fn(),
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

    outfitServiceMock.getOutfitById.mockReset();
    outfitServiceMock.deleteOutfit.mockReset();

    outfitServiceMock.getOutfitById.mockReturnValue(of(mockOutfit));
    outfitServiceMock.deleteOutfit.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [OutfitDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
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
    fixture = TestBed.createComponent(OutfitDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create the component and load the outfit from the route id', () => {
    createComponent();

    expect(component).toBeTruthy();

    expect(outfitServiceMock.getOutfitById).toHaveBeenCalledTimes(1);
    expect(outfitServiceMock.getOutfitById).toHaveBeenCalledWith('outfit-1');

    expect(component.outfit()).toEqual(mockOutfit);
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should display the loading state while the outfit is loading', () => {
    const outfitSubject = new Subject<Outfit>();

    outfitServiceMock.getOutfitById.mockReturnValue(outfitSubject.asObservable());

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.isLoading()).toBe(true);
    expect(element.textContent).toContain('Loading outfit...');

    outfitSubject.next(mockOutfit);
    outfitSubject.complete();

    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(element.textContent).not.toContain('Loading outfit...');
    expect(element.textContent).toContain('Gallery Evening');
  });

  it('should display an error when no outfit id is present', () => {
    routeId = null;

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(outfitServiceMock.getOutfitById).not.toHaveBeenCalled();
    expect(component.outfit()).toBeNull();
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('No outfit id found.');

    expect(element.textContent).toContain('No outfit id found.');

    expect(element.querySelector('.outfit-detail-page__back-link')).toBeNull();
  });

  it('should display an error when the outfit cannot be loaded', () => {
    outfitServiceMock.getOutfitById.mockReturnValue(throwError(() => new Error('API error')));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.outfit()).toBeNull();
    expect(component.isLoading()).toBe(false);

    expect(component.errorMessage()).toBe('Outfit could not be loaded.');

    expect(element.textContent).toContain('Outfit could not be loaded.');
  });

  it('should render the outfit details and its clothing items', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const pieces = element.querySelectorAll('.outfit-piece');
    const image = element.querySelector<HTMLImageElement>('.outfit-piece__media img');

    expect(element.querySelector('h1')?.textContent).toContain('Gallery Evening');

    expect(element.textContent).toContain('Black tailoring with silver accessories.');

    expect(element.textContent).toContain('2 pieces');
    expect(pieces.length).toBe(2);

    expect(element.textContent).toContain('Black Blazer');
    expect(element.textContent).toContain('Wide Leg Trousers');

    expect(element.textContent).toContain('ARKET');
    expect(element.textContent).toContain('Black');
    expect(element.textContent).toContain('S');

    expect(image?.src).toBe('https://example.com/blazer.jpg');
    expect(image?.alt).toBe('Black Blazer');
  });

  it('should display the singular piece label for one item', () => {
    const singleItemOutfit = {
      ...mockOutfit,
      notes: undefined,
      items: [mockOutfit.items[0]],
    } as Outfit;

    outfitServiceMock.getOutfitById.mockReturnValue(of(singleItemOutfit));

    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('1 piece');
    expect(element.textContent).not.toContain('2 pieces');

    expect(element.textContent).not.toContain('Black tailoring with silver accessories.');
  });

  it('should render the edit link for the loaded outfit', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const editLink = element.querySelector<HTMLAnchorElement>('.outfit-detail-page__back-link');

    expect(editLink).not.toBeNull();
    expect(editLink?.textContent?.trim()).toBe('Edit outfit');
    expect(editLink?.getAttribute('href')).toContain('/outfits/outfit-1/edit');
  });

  it('should render links to the clothing item detail pages', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;

    const itemLinks = element.querySelectorAll<HTMLAnchorElement>('a[href*="/items/item-1"]');

    expect(itemLinks.length).toBe(2);

    expect(itemLinks[0].getAttribute('href')).toContain('/items/item-1');

    expect(itemLinks[0].getAttribute('href')).toContain('returnTo');
  });

  it('should show and hide the delete confirmation', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const initialDeleteButton = element.querySelector<HTMLButtonElement>(
      '.outfit-detail-page__delete-button',
    );

    expect(component.showDeleteConfirmation()).toBe(false);
    expect(initialDeleteButton?.textContent?.trim()).toBe('Delete outfit');

    initialDeleteButton?.click();
    fixture.detectChanges();

    expect(component.showDeleteConfirmation()).toBe(true);
    expect(element.textContent).toContain('Delete this outfit? This cannot be undone.');

    const cancelButton = element.querySelector<HTMLButtonElement>(
      '.outfit-detail-page__cancel-button',
    );

    cancelButton?.click();
    fixture.detectChanges();

    expect(component.showDeleteConfirmation()).toBe(false);
    expect(element.textContent).not.toContain('Delete this outfit? This cannot be undone.');
  });

  it('should not delete anything when no outfit is loaded', () => {
    createComponent();

    component.outfit.set(null);
    outfitServiceMock.deleteOutfit.mockClear();

    component.deleteOutfit();

    expect(outfitServiceMock.deleteOutfit).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isDeleting()).toBe(false);
  });

  it('should delete the outfit and navigate to the outfits overview', () => {
    createComponent();

    component.deleteOutfit();

    expect(outfitServiceMock.deleteOutfit).toHaveBeenCalledTimes(1);
    expect(outfitServiceMock.deleteOutfit).toHaveBeenCalledWith('outfit-1');

    expect(router.navigate).toHaveBeenCalledWith(['/outfits']);
  });

  it('should display the deleting state while the request is pending', () => {
    const deleteSubject = new Subject<void>();

    outfitServiceMock.deleteOutfit.mockReturnValue(deleteSubject.asObservable());

    createComponent();

    component.requestDelete();
    component.deleteOutfit();

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    const confirmButton = element.querySelector<HTMLButtonElement>(
      '.outfit-detail-page__delete-button',
    );

    const cancelButton = element.querySelector<HTMLButtonElement>(
      '.outfit-detail-page__cancel-button',
    );

    expect(component.isDeleting()).toBe(true);

    expect(confirmButton?.textContent?.trim()).toBe('Deleting...');
    expect(confirmButton?.disabled).toBe(true);
    expect(cancelButton?.disabled).toBe(true);

    deleteSubject.next();
    deleteSubject.complete();
  });

  it('should clear an existing error before deleting', () => {
    const deleteSubject = new Subject<void>();

    outfitServiceMock.deleteOutfit.mockReturnValue(deleteSubject.asObservable());

    createComponent();

    component.errorMessage.set('Previous error');

    component.deleteOutfit();

    expect(component.errorMessage()).toBeNull();
    expect(component.isDeleting()).toBe(true);
  });

  it('should handle an error when the outfit cannot be deleted', () => {
    outfitServiceMock.deleteOutfit.mockReturnValue(throwError(() => new Error('Delete failed')));

    createComponent();

    component.deleteOutfit();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(component.errorMessage()).toBe('Outfit could not be deleted.');

    expect(component.isDeleting()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();

    expect(element.textContent).toContain('Outfit could not be deleted.');
  });
});
