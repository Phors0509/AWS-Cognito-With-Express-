import ProductModel, { IProduct } from "../database/models/product.model"

import ProductRepository from "@/database/repositories/product.repository"

jest.mock("../database/models/product.model")

describe("ProductRepository Testing", () => {

    let productRepository = ProductRepository;

    afterEach((() => {
        jest.clearAllMocks()
    }))

    describe("Get Product By ID", () => {
        it("should return product by id", async () => {

            const mockProduct: IProduct = {
                name: 'Test Product',
                price: 100,
                description: 'This is a test product',
                fileLocation: 'pic.jpg',
            };

            (ProductModel.findById as jest.Mock).mockResolvedValue(mockProduct)
            const result = await productRepository.getProductById("1")

            expect(result).toEqual(mockProduct)
        })
    })

    describe("Delete Product", () => {
        it("should delete a product by id", async () => {
            const mockProduct: IProduct = {
                name: 'Test Product',
                price: 100,
                description: 'This is a test product',
                fileLocation: 'pic.jpg',
            };

            (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct)
            const result = await productRepository.deleteProduct("1")
            expect(result).toBe(mockProduct)

            it("should error when product not found", async () => {
                (ProductModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null)
                await expect(productRepository.deleteProduct("1")).rejects.toThrow()
            })

        })
    })

})