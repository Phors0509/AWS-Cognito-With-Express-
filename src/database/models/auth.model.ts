import mongoose from "mongoose";

export interface IAuth {
    email: string
    password: string
}

export interface IAuthVerify {
    code: string
}

const AuthSchema = new mongoose.Schema<IAuth>({
    email: { type: String, required: true },
    password: { type: String, required: true },
},
    { timestamps: true });

const AuthModel = mongoose.model<IAuth>("Auth", AuthSchema)
export default AuthModel;