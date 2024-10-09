import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import productRepository from "@/database/repositories/product.repository";
import ProductModel from "@/database/models/product.model";
import { NotFoundError } from '@/utils/errors';

// initialize a MongoMemoryServer testing without affecting a real database.

let mongoServer: MongoMemoryServer;

// Lifecycle Hooks //

// runs before all tests in this file

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
})

// runs after all tests in this file 

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
})

// runs before each individual test

beforeEach(async () => {
    await ProductModel.deleteMany({});
})

// Test Suites

// Describe Block:

describe("GET : get all products", () => {

    // Test Case:

    it("should get all products", async () => {
        await ProductModel.create({
            name: "Coca",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Coca.jpg"
        })

        await ProductModel.create({
            name: "Pepsi",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Pepsi.jpg"
        })

        const result = await productRepository.getAllProducts()
        expect(result.length).toBe(2)
    })
})


describe("POST : createProduct", () => {
    it("should creaete a product", async () => {
        const newProduct = {
            name: "Coca Cola Haha",
            price: 2.5,
            description: "A very nice drink",
            fileLocation: "cocacola.jpg"
        }

        const result = await productRepository.createProduct(newProduct)

        expect(result.name).toBe(newProduct.name)
        expect(result.price).toBe(newProduct.price)
        expect(result.description).toBe(newProduct.description)
    })
})

describe("GET : get product by Id", () => {
    it("should get a product by ID ", async () => {
        const getProductById = await ProductModel.create({
            name: "Coca",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Coca.jpg"
        })

        const result = await productRepository.getProductById(getProductById._id.toString())
        expect(result.name).toBe("Coca")
        expect(result.price).toBe(2.5)
        expect(result.description).toBe("A very cool drink")
    })

    it("should throw the NotFoundError if not found product", async () => {
        const notFound = new mongoose.Types.ObjectId().toString()
        await expect(productRepository.getProductById(notFound)).rejects.toThrow(NotFoundError)

    })
})

describe("PUT : update product", () => {
    it("should update a product", async () => {
        const updateProduct = await ProductModel.create({
            name: "Coca",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Coca.jpg"
        })

        const updatedProduct = {
            name: "Pepsi",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Pepsi.jpg"
        }

        const result = await productRepository.updateProduct(updateProduct._id.toString(), updatedProduct)

        expect(result.name).toBe(updatedProduct.name)
        expect(result.price).toBe(updatedProduct.price)
        expect(result.description).toBe(updatedProduct.description)
    })

    it("should throw the NotFoundError if not found product", async () => {
        const notFound = new mongoose.Types.ObjectId().toString()
        const updatedProduct = {
            name: "Pepsi",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Pepsi.jpg"
        }
        await expect(productRepository.updateProduct(notFound, updatedProduct)).rejects.toThrow(NotFoundError)
    })
})

describe("DELETE : delete product", () => {
    it("should delete a product", async () => {
        const deleteProduct = await ProductModel.create({
            name: "Coca",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Coca.jpg"
        })

        const result = await productRepository.deleteProduct(deleteProduct._id.toString())
        expect(result.name).toBe("Coca")
        expect(result.price).toBe(2.5)
        expect(result.description).toBe("A very cool drink")
    })

    it("should throw the NotFoundError if not found product", async () => {
        const notFound = new mongoose.Types.ObjectId().toString()
        await expect(productRepository.deleteProduct(notFound)).rejects.toThrow(NotFoundError)
    })
})
