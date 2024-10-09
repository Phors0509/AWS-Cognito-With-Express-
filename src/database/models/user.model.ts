import mongoose from "mongoose";

export interface IUser {
    name: string;
    age: number;
    gender: string;
    email: string;
    password: string;
    sub: string;
    googleSub: string,
    facebookSub: string,
}

const UserSchema = new mongoose.Schema<IUser>({
    sub: { type: String, required: true },
    googleSub: { type: String, required: false },
    facebookSub: { type: String, required: false },
},
    { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;