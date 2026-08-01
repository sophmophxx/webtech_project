import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OUTFITS_API_URL } from '../constants/api.constants';
import { Outfit } from '../../shared/models/outfit.model';

export interface CreateOutfitRequest {
  name: string;
  notes?: string;
  items: string[];
  favorite?: boolean;
}

export type UpdateOutfitRequest = Partial<CreateOutfitRequest>;

/**
 * Handles all HTTP requests related to outfits.
 * Components use this service instead of calling the backend API directly.
 */
@Injectable({
  providedIn: 'root',
})
export class OutfitService {
  private readonly http = inject(HttpClient);

  /**
   * Loads all outfits from the backend.
   */
  getOutfits(): Observable<Outfit[]> {
    return this.http.get<Outfit[]>(OUTFITS_API_URL);
  }

  /**
   * Loads a single outfit by its id.
   */
  getOutfitById(id: string): Observable<Outfit> {
    return this.http.get<Outfit>(`${OUTFITS_API_URL}/${id}`);
  }

  /**
   * Creates a new outfit from selected clothing item ids.
   */
  createOutfit(payload: CreateOutfitRequest): Observable<Outfit> {
    return this.http.post<Outfit>(OUTFITS_API_URL, payload);
  }

  /**
   * Updates an existing outfit with partial data.
   */
  updateOutfit(id: string, payload: UpdateOutfitRequest): Observable<Outfit> {
    return this.http.patch<Outfit>(`${OUTFITS_API_URL}/${id}`, payload);
  }

  /**
   * Deletes an outfit by its id.
   */
  deleteOutfit(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${OUTFITS_API_URL}/${id}`);
  }
}
