import {
    Controller,
    Post,
    Route,
    Tags,
    Request,
    SuccessResponse,
    Response,
    Res,
} from 'tsoa';
import { upload } from '../middlewares/uploadMiddleware';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import productCreateSchema from '@/schema/productCreateSchema';
import Product, { IProduct } from '@/database/models/product.model'; // Import the Product model

@Route('upload')
@Tags('Upload')
export class UploadController extends Controller {
    @Post('/')
    @SuccessResponse('201', 'Product created successfully')
    @Response('400', 'Bad Request')
    public async uploadFile(
        @Request() request: ExpressRequest,
        @Res() res: ExpressResponse
    ): Promise<{ message: string; product: IProduct }> {
        try {
            await new Promise<void>((resolve, reject) => {
                upload.single('image')(request, res as any, (error: any) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            });

            // Validate form data using Joi
            const { error: validationError, value } = productCreateSchema.validate(request.body, {
                abortEarly: false,
                convert: true,
            });

            if (validationError) {
                this.setStatus(400);
                const errorMessages = validationError.details.map((detail) => detail.message).join(', ');
                throw new Error(`Validation error: ${errorMessages}`);
            }

            const file = request.file as Express.MulterS3.File;

            // Create a new product document
            const newProduct = new Product({
                name: value.name,
                price: value.price,
                description: value.description,
                fileLocation: file.location, // S3 file URL
            });

            // Save the product to MongoDB
            const savedProduct = await newProduct.save();

            this.setStatus(201); // Set HTTP status to 201 Created

            return {
                message: 'Product created successfully',
                product: savedProduct,
            };
        } catch (error: any) {
            this.setStatus(400);
            return { message: error.message } as any;
        }
    }

    // ... existing GET method (if any)
}
