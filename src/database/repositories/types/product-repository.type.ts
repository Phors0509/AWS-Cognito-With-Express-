export interface ProductFilterParams {
    category?: string;
}

export interface ProductSortParams {
    name?: 'asc' | 'desc';
    price?: 'asc' | 'desc';
}

export interface ProductGetAllRepoParams {
    page?: number;
    limit?: number;
    filter?: ProductFilterParams;
    sort?: ProductSortParams;
}

