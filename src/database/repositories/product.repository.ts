import ProductModel, { IProduct } from "@/database/models/product.model"
import { ProductCreateRequest, ProductUpdateRequest } from "@/controllers/types/product-request.type"
import { ProductGetAllRepoParams, ProductSortParams } from "@/database/repositories/types/product-repository.type";
import { SortOrder } from "./types/productParams";
import { NotFoundError } from "@/utils/errors";

class ProductRepository {

    async getAll(queries: ProductGetAllRepoParams) {
        const { page = 1, limit = 10, filter = {}, sort = { name: 'desc' } } = queries;

        // Convert sort from {'field': 'desc'} to {'field': -1}
        const sortFields = Object.keys(sort).reduce((acc, key) => {
            const direction = sort[key as keyof ProductSortParams];
            if (direction === 'asc' || direction === 'desc') {
                acc[key as keyof ProductSortParams] = direction === 'asc' ? 1 : -1;
            }
            return acc;
        }, {} as Record<keyof ProductSortParams, SortOrder>);

        // Build MongoDB filter object
        const buildFilter = (filter: Record<string, any>) => {
            const mongoFilter: Record<string, any> = {};
            for (const key in filter) {
                if (typeof filter[key] === 'object') {
                    if (filter[key].hasOwnProperty('min') || filter[key].hasOwnProperty('max')) {
                        mongoFilter[key] = {};
                        if (filter[key].min !== undefined) {
                            mongoFilter[key].$gte = filter[key].min;
                        }
                        if (filter[key].max !== undefined) {
                            mongoFilter[key].$lte = filter[key].max;
                        }
                    } else {
                        mongoFilter[key] = filter[key];
                    }
                } else {
                    mongoFilter[key] = filter[key];
                }
            }
            return mongoFilter;
        };

        try {
            const mongoFilter = buildFilter(filter);
            const operation = ProductModel.find(mongoFilter)
                .sort(sortFields)
                .skip((page - 1) * limit)
                .limit(limit);

            const result = await operation;
            const totalItems = await ProductModel.countDocuments(mongoFilter);

            return {
                [ProductModel.collection.collectionName]: result,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            };
        } catch (error) {
            console.error(`ProductRepository - getAll() method error: ${error}`);
            throw error;
        }
    }



    public async getAllProducts(): Promise<IProduct[]> {
        try {
            const products = await ProductModel.find()
            return products
        } catch (error) {
            throw error
        }
    }
    public async createProduct(productRequest: ProductCreateRequest): Promise<IProduct> {
        try {
            const newProduct = await ProductModel.create(productRequest)
            return newProduct
        } catch (error) {
            throw error;
        }
    }
    public async getProductById(id: string): Promise<IProduct> {
        try {
            const product = await ProductModel.findById(id)
            if (!product) {
                throw new NotFoundError(`Product Not Found with id ${id}`)
            }
            return product
        } catch (error) {
            throw error
        }
    }

    public async updateProduct(id: string, productRequest: ProductUpdateRequest): Promise<IProduct> {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(id, productRequest, { new: true })
            if (!updatedProduct) {
                throw new NotFoundError("Product Not Found")
            }
            return updatedProduct
        } catch (error) {
            throw error
        }
    }
    public async deleteProduct(id: string): Promise<IProduct> {
        try {
            const deletedProduct = await ProductModel.findByIdAndDelete(id)
            if (!deletedProduct) {
                throw new NotFoundError(`Product Not Found with id ${id}`)
            }
            return deletedProduct
        } catch (error) {
            throw error
        }
    }
}

export default new ProductRepository()