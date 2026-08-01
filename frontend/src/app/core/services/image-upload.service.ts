import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UPLOADS_API_URL } from '../constants/api.constants';

export interface ImageUploadResponse {
  imageUrl: string;
  publicId: string;
}

/**
 * Handles image uploads to the backend.
 * The backend stores the image in Cloudinary and returns the hosted image URL.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  /**
   * Uploads a selected image file as multipart/form-data.
   */
  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ImageUploadResponse>(UPLOADS_API_URL, formData);
  }
}
