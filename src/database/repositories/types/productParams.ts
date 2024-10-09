export type SortOrder = 1 | -1;

export interface ProductSortParams {
    name?: 'asc' | 'desc';
    price?: 'asc' | 'desc';
    description?: 'asc' | 'desc';
}