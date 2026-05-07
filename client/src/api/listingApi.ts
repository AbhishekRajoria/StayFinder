import axios from '@/lib/axios';
export interface Listing {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  amenities: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  host: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateListingData {
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  propertyType: "house" | "apartment" | "villa" | "condo" | "studio";
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ListingsData {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ListingsResponse extends ApiResponse<ListingsData> {}

export interface ListingFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export const getListings = async (filters?: ListingFilters): Promise<ListingsResponse> => {
  const response = await axios.get("/listings", { params: filters });
  return response.data;
};

export const getListing = async (id: string): Promise<ApiResponse<{ listing: Listing }>> => {
  const response = await axios.get(`/listings/${id}`);
  return response.data;
};

export const getMyListings = async (): Promise<ApiResponse<{ listings: Listing[] }>> => {
  const response = await axios.get("/listings/me");
  return response.data;
};

export const createListing = async (data: CreateListingData | FormData): Promise<ApiResponse<{ listing: Listing }>> => {
  const isFormData = data instanceof FormData;
  const response = await axios.post("/listings", data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data;
};

export const updateListing = async (id: string, data: FormData): Promise<ApiResponse<{ listing: Listing }>> => {
  
  const response = await axios.put(`/listings/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteListing = async (id: string): Promise<ApiResponse<void>> => {
  const response = await axios.delete(`/listings/${id}`);
  return response.data;
};

export const uploadImage = async (file: File): Promise<ApiResponse<{ url: string }>> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await axios.post('/api/listings/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getListingBookings = async (listingId: string): Promise<{ startDate: string; endDate: string; }[]> => {
  const response = await axios.get(`/listings/${listingId}/bookings`);
  // Server returns the array directly (res.json(bookings)), not wrapped in
  // { success, data } — handle both for safety.
  return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
};
