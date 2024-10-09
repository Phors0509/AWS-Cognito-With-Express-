import { ProductCreateRequest, ProductGetAllRequest, ProductUpdateRequest } from "@/controllers/types/product-request.type";
import { IProduct } from "@/database/models/product.model";
import ProductRepository from "@/database/repositories/product.repository";

export class ProductService {
    async getAllProducts(queries: ProductGetAllRequest) {
        try {
            const { page, limit, filter, sort } = queries

            const newQueries = {
                page,
                limit,
                filter: filter && JSON.parse(filter),
                sort: sort && JSON.parse(sort)
            }
            const result = await ProductRepository.getAll(newQueries)

            return result;
        } catch (error) {
            console.error(`ProductService - getAllProducts() method error: ${error}`)
            throw error;
        }
    }
    public async createProduct(productRequest: ProductCreateRequest): Promise<IProduct> {
        try {
            const newProduct = await ProductRepository.createProduct(productRequest)
            return newProduct
        } catch (error) {
            console.log(`ProductService - createProduct() method error ${error}`)
            throw error
        }
    }
    public async getProductById(id: string): Promise<IProduct> {
        try {
            const product = await ProductRepository.getProductById(id)
            return product
        } catch (error) {
            console.log(`ProductService - getProductById() method error ${error}`)
            throw error
        }
    }

    public async updateProduct(id: string, productRequest: ProductUpdateRequest): Promise<IProduct> {
        try {
            const updatedProduct = await ProductRepository.updateProduct(id, productRequest)

            return updatedProduct
        } catch (error) {
            console.log(`ProductService - updateProduct() method error ${error}`)
            throw error
        }
    }
    public async deleteProduct(id: string): Promise<IProduct> {
        try {
            const deletedProduct = await ProductRepository.deleteProduct(id)
            return deletedProduct
        } catch (error) {
            console.log(`ProductService - deleteProduct() method error ${error}`)
            throw error
        }
    }
}


export default new ProductService();