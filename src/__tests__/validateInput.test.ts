import { Request, Response, NextFunction } from 'express';
import validateRequest from '../middlewares/validateRequest';
import productCreateSchema from '@/schema/productCreateSchema';
import Joi from 'joi';

// Test Suite
describe("validateRequest middleware", () => {
    // setup mock request and response objects for each test
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    // Helper function to run validation test
    const runValidationTest = async (body: object, expectedErrorMessage: string) => {
        const middleware = validateRequest(productCreateSchema);
        req.body = body;
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        const errorArg = (next as jest.Mock).mock.calls[0][0];

        expect(errorArg).toBeInstanceOf(Error);
        expect((errorArg as any).details[0].message).toBe(expectedErrorMessage);
    };

    // Helper function to run validation test is success
    const runValidationTestIsSuccess = async (body: object) => {
        const middleware = validateRequest(productCreateSchema);
        req.body = body;
        await middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

    };

    // Helper function to run validation test is extra field
    const runValidationTestIsExtraField = async (body: object) => {
        const extraFieldShema = Joi.object({
            name: Joi.string().required().min(2),
            price: Joi.number().required(),
            description: Joi.string().required(),
            extraField: Joi.string().optional(),

        }).options({ convert: true });

        req.body = body;
        const middleware = validateRequest(extraFieldShema);

        await middleware(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledWith();
        expect(next).toHaveBeenCalledTimes(1);
    };

    // Test Cases

    it("should call next without error if validate success", () => {
        runValidationTestIsSuccess({ name: "A sample product", price: 10, description: "A sample description" });
    });

    it(`should call next with error if validate field is (missing "name")`, () => {
        runValidationTest({ price: 10, description: "A sample description" }, '"name" is required');
    });

    it("should call next with error if validation fails (invalid price)", () => {
        runValidationTest({
            name: "Valid Name",
            price: "free", // Invalid type
            description: "A valid description",
        }, '"price" must be a number')
    })

    it("should call next with error if validate field is (missing 'description')", () => {
        runValidationTest({ name: "A sample product", price: 10 }, '"description" is required');
    });

    it("should call next with error if validate field is (name is less than 2 characters)", () => {
        runValidationTest({ name: "A", price: 10, description: "A sample description" }, '"name" length must be at least 2 characters long');
    });

    it("should call next with error if validate field is (description is less than 2 characters)", () => {
        runValidationTest({ name: "A sample product", price: 10, description: "A" }, '"description" length must be at least 2 characters long');
    });

    it("should call next with error if validate field is (empty object)", () => {
        runValidationTest({}, '"name" is required');
    });

    it("should allow additional fields if they are not defined in the schema", () => {
        runValidationTestIsExtraField({ name: "A sample product", price: 10, description: "A sample description", extraField: "extra field" });
    });

});