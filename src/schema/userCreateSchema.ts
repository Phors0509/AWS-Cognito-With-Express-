import Joi from "joi";

const userCreateSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    // Add other fields and validation rules as necessary
});

export default userCreateSchema;