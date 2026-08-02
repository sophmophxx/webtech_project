import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CreateOutfitRequest, OutfitService, UpdateOutfitRequest } from './outfit.service';
import { OUTFITS_API_URL } from '../constants/api.constants';
import { Outfit } from '../../shared/models/outfit.model';

describe('OutfitService', () => {
  let service: OutfitService;
  let httpTesting: HttpTestingController;

  const mockOutfit = {
    _id: 'outfit-1',
    name: 'Gallery Evening',
    notes: 'Black tailoring.',
    favorite: true,
    items: [
      {
        _id: 'item-1',
        name: 'Black Blazer',
        category: 'outerwear',
        favorite: false,
      },
    ],
  } as Outfit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OutfitService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OutfitService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load all outfits', () => {
    const expectedOutfits = [mockOutfit];

    service.getOutfits().subscribe((outfits) => {
      expect(outfits).toEqual(expectedOutfits);
    });

    const request = httpTesting.expectOne(OUTFITS_API_URL);

    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();

    request.flush(expectedOutfits);
  });

  it('should load one outfit by id', () => {
    service.getOutfitById('outfit-1').subscribe((outfit) => {
      expect(outfit).toEqual(mockOutfit);
    });

    const request = httpTesting.expectOne(`${OUTFITS_API_URL}/outfit-1`);

    expect(request.request.method).toBe('GET');
    expect(request.request.body).toBeNull();

    request.flush(mockOutfit);
  });

  it('should create an outfit', () => {
    const payload: CreateOutfitRequest = {
      name: 'Gallery Evening',
      notes: 'Black tailoring.',
      items: ['item-1'],
      favorite: true,
    };

    service.createOutfit(payload).subscribe((outfit) => {
      expect(outfit).toEqual(mockOutfit);
    });

    const request = httpTesting.expectOne(OUTFITS_API_URL);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(mockOutfit);
  });

  it('should update an outfit with partial data', () => {
    const payload: UpdateOutfitRequest = {
      name: 'Updated Gallery Evening',
      favorite: false,
    };

    const updatedOutfit = {
      ...mockOutfit,
      ...payload,
    } as Outfit;

    service.updateOutfit('outfit-1', payload).subscribe((outfit) => {
      expect(outfit).toEqual(updatedOutfit);
    });

    const request = httpTesting.expectOne(`${OUTFITS_API_URL}/outfit-1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush(updatedOutfit);
  });

  it('should delete an outfit', () => {
    const response = {
      message: 'Outfit gelöscht',
    };

    service.deleteOutfit('outfit-1').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${OUTFITS_API_URL}/outfit-1`);

    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toBeNull();

    request.flush(response);
  });
});
