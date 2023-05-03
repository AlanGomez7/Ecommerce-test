const Joi = require("joi");

const addressSchema = Joi.object({
    username: Joi.string().required(),
    mobile: Joi.string().length(10).required(),
    pincode: Joi.string(),
    locality: Joi.string().required(),
    address: Joi.string().required(),
    district: Joi.string().required(),
    state: Joi.string().required(),
    alternatemobile: Joi.string().length(10).required(),
});

module.exports = {
   addressSchema,
};