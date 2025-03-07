export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  cached?: boolean;
  cachedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  next?: string;
  pagesFetched: number;
  timestamp: number;
}