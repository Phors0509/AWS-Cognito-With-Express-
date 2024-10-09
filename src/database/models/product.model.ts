import mongoose from 'mongoose';

export interface IProduct {
    name: string;
    price: number;
    description: string;
    // fileLocation: string; // URL of the uploaded file on S3
    // createdAt: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    // fileLocation: { type: String, required: true },
});

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
export default ProductModel;