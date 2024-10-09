import { IProduct } from "../../database/models/product.model";


export interface ProductResponse {
    message: string;
    data: IProduct
}

export interface ProductPaginatedResponse {
    message: string;
    data: {
        [key: string]: IProduct[] | number;
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }
}