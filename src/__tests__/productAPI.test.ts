import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import dotenv from 'dotenv';

// import ProductModel from "../database/models/product.model"
dotenv.config();

const dbUri = "mongodb+srv://phorsbeatrmx0509:Phorsbeatrmx0509@tsoa.iaijc.mongodb.net/";

const app = express();

// Global Middlewares
app.use(express.json());

describe("Product API", () => {
    beforeAll(async () => {
        await mongoose.connect(dbUri);
        console.log("Connected to MongoDB" + dbUri);
    });
    // beforeEach(async () => {
    //     await ProductModel.deleteMany({});
    // });
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("should create a new product", async () => {
        const newProduct = {
            name: "Coca",
            price: 2.5,
            description: "A very cool drink",
            fileLocation: "Coca.jpg"
        };

        const response = await request(app)
            .post("/products")
            .send(newProduct)

        expect(response.status).toBe(201);
        // expect(response.body.data.name).toBe(newProduct.name);
        // expect(response.body.data.price).toBe(newProduct.price);
        // expect(response.body.data.description).toBe(newProduct.description);
        // expect(response.body.data.fileLocation).toBe(newProduct.fileLocation);
    });
});