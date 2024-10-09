import { Body, Controller, Delete, Get, Middlewares, Path, Post, Put, Queries, Route, SuccessResponse, } from "tsoa";
import { ProductCreateRequest, ProductGetAllRequest, ProductUpdateRequest } from "./types/product-request.type";
import ProductService from "@/services/product.service";
import validateRequest from "@/middlewares/validateRequest";
import productCreateSchema from "@/schema/productCreateSchema";
import { ProductPaginatedResponse, ProductResponse } from "./types/product-response.type";

@Route("products")
export class ProductController extends Controller {
    // Get all products
    @SuccessResponse("200", "OK")
    @Get()
    public async getAllProducts(
        @Queries() queries: ProductGetAllRequest
    ): Promise<ProductPaginatedResponse> {
        try {
            const response = await ProductService.getAllProducts(queries);

            return {
                message: "success",
                data: response
            };
        } catch (error) {
            console.error(`ProductsController - getAllProducts() method error: ${error}`);
            throw error;
        }
    }

    // Get a product by id
    @SuccessResponse("200", "OK")
    @Get("{id}")
    public async getProductByID(@Path() id: string): Promise<ProductResponse> {
        try {
            const product = await ProductService.getProductById(id)
            return {
                message: "Success",
                data: product
            }
        } catch (error) {
            console.log("ProductController - getProduct() method error", error)
            throw error
        }

    }

    // Create a new product
    @Post()
    @SuccessResponse("201", "Created Successfully")
    @Middlewares(validateRequest(productCreateSchema))
    public async createProduct(@Body() requestBody: ProductCreateRequest): Promise<ProductResponse> {
        try {
            const newProduct = await ProductService.createProduct(requestBody);
            return {
                message: "success",
                data: {
                    name: newProduct.name,
                    price: newProduct.price,
                    description: newProduct.description,
                }
            }
        } catch (error) {
            console.log("ProductController - createProduct() method", error)
            throw error;
        }
    }


    // Update a product
    @SuccessResponse("204", "Updated Successfully")
    @Put("{id}")
    public async updateProduct(@Path() id: string, @Body() requestBody: ProductUpdateRequest): Promise<ProductResponse> {
        try {
            const updatedProduct = await ProductService.updateProduct(id, requestBody);
            return { message: "Success", data: updatedProduct };
        } catch (error) {
            console.log("ProductController - updateProduct() method error", error);
            throw error;
        }
    }

    // Delete a product
    @SuccessResponse("204", "Deleted Successfully")
    @Delete("{id}")
    public async deleteProduct(@Path() id: string): Promise<void> {
        try {
            await ProductService.deleteProduct(id);
        } catch (error) {
            console.log("ProductController - deleteProduct() method error", error);
            throw error;
        }
    }
}