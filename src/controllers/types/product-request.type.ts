export interface ProductCreateRequest {
    name: string;
    price: number;
    description: string;
}

export interface ProductUpdateRequest {
    name?: string;
    price?: number;
    description?: string;
}

export interface ProductGetAllRequest {
    page?: number;
    limit?: number;
    filter?: string
    sort?: string
}
