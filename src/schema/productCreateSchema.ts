import Joi from 'joi';

const productCreateSchema = Joi.object({
    name: Joi.string().required().min(2),
    price: Joi.number().required(),
    description: Joi.string().required().min(2),
}).options({ convert: true });

export default productCreateSchema;