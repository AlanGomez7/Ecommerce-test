const Joi = require("joi");

const productSchema = Joi.object({
    uniqueId : Joi.string().required(),
    title : Joi.string().min(3).max(20).required(),
    description : Joi.string().min(10).max(100).required(),
    brand : Joi.string().min(3).max(20).required(),
    price: Joi.number().min(1).required(),
    category: Joi.string(),
    stock : Joi.number().min(1).required(),
    isListed : Joi.boolean().required(),
    image : Joi.array().required()
});

module.exports = {
   productSchema,
};