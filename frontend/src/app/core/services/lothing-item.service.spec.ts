import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  ClothingItemService,
  CreateClothingItemRequest,
  UpdateClothingItemRequest,
} from './clothing-item.service';
import { ITEMS_API_URL } from '../constants/api.constants';
import { ClothingItem } from '../../shared/models/clothing-item.model';

describe('ClothingItemService', () => {
  let service: ClothingItemService;
  let httpTesting: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClothingItemService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ClothingItemService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all clothing items', () => {
    const expectedItems = [
      mockItem,
      {
        ...mockItem,
        _id: 'item-2',
        name: 'Wide Leg Trousers',
        category: 'bottoms',
      },
    ] as ClothingItem[];

    service.getItems().subscribe((items) => {
      expect(items).toEqual(expectedItems);
    });

    const request = httpTesting.expectOne(ITEMS_API_URL);

    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();

    request.flush(expectedItems);
  });

  it('should load one clothing item by id', () => {
    service.getItemById('item-1').subscribe((item) => {
      expect(item).toEqual(mockItem);
    });

    const request = httpTesting.expectOne(`${ITEMS_API_URL}/item-1`);

    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();

    request.flush(mockItem);
  });

  it('should create a clothing item', () => {
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

    service.createItem(payload).subscribe((item) => {
      expect(item).toEqual(mockItem);
    });

    const request = httpTesting.expectOne(ITEMS_API_URL);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(mockItem);
  });

  it('should update a clothing item with partial data', () => {
    const payload: UpdateClothingItemRequest = {
      name: 'Updated Black Blazer',
      color: 'Charcoal',
      favorite: false,
    };

    const updatedItem = {
      ...mockItem,
      ...payload,
    } as ClothingItem;

    service.updateItem('item-1', payload).subscribe((item) => {
      expect(item).toEqual(updatedItem);
    });

    const request = httpTesting.expectOne(`${ITEMS_API_URL}/item-1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(updatedItem);
  });

  it('should delete a clothing item', () => {
    const response = {
      message: 'Item gelöscht',
    };

    service.deleteItem('item-1').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${ITEMS_API_URL}/item-1`);

    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();

    request.flush(response);
  });

  it('should pass HTTP errors to the subscriber', () => {
    let receivedStatus: number | undefined;

    service.getItemById('missing-item').subscribe({
      next: () => {
        throw new Error('The request should not succeed.');
      },
      error: (error) => {
        receivedStatus = error.status;
      },
    });

    const request = httpTesting.expectOne(`${ITEMS_API_URL}/missing-item`);

    request.flush(
      {
        message: 'Item nicht gefunden',
      },
      {
        status: 404,
        statusText: 'Not Found',
      },
    );

    expect(receivedStatus).toBe(404);
  });
});
