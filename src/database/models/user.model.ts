// user.model.ts
import mongoose, { Schema } from "mongoose";

export interface IUser {
    email: string;
    cognitoId: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}


const UserSchema = new Schema({
    email: { type: String, required: true },
    cognitoId: { type: String, required: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
}, { timestamps: true });
export default mongoose.model<IUser>('User', UserSchema);