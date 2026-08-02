import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ClothingItemCard } from './clothing-item-card';
import { ClothingItem } from '../../../../shared/models/clothing-item.model';

describe('ClothingItemCard', () => {
  let fixture: ComponentFixture<ClothingItemCard>;

  const item: ClothingItem = {
    _id: '1',
    name: 'Black Draped Dress',
    category: 'dresses',
    brand: 'Ann Demeulemeester',
    color: 'black',
    size: 'S',
    imageUrl: '/images/seed/black-dress.jpg',
    favorite: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingItemCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ClothingItemCard);

    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
  });

  it('should display the item name and category', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Black Draped Dress');
    expect(compiled.textContent).toContain('dresses');
  });

  it('should display optional item details', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Ann Demeulemeester');
    expect(compiled.textContent).toContain('black');
    expect(compiled.textContent).toContain('S');
  });

  it('should display the item image', () => {
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('/images/seed/black-dress.jpg');
    expect(image.getAttribute('alt')).toBe('Black Draped Dress');
  });
});
