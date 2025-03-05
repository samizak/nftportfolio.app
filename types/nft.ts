export interface CollectionData {
  collection: string;
  name: string;
  quantity: number;
  image_url: string;
  is_verified: boolean;
  floor_price?: number;
  total_value?: number;
}

export interface FilterValues {
  min: string;
  max: string;
}

export type SortColumn =
  | "name"
  | "quantity"
  | "floorPrice"
  | "value"
  | "percentage";
export type SortDirection = "asc" | "desc";
