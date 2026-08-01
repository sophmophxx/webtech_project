import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export const ITEMS_API_URL = `${API_BASE_URL}/items`;
export const OUTFITS_API_URL = `${API_BASE_URL}/outfits`;
export const UPLOADS_API_URL = `${API_BASE_URL}/uploads`;
