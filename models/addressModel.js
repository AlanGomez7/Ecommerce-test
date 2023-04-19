const Joi = require("joi");

const addressSchema = Joi.object({
    fname: Joi.string(),
    lname: Joi.string(),
    address: Joi.string().required(),
    buildingname: Joi.string(),
    state: Joi.string().required(),
    phone:  Joi.string().length(10).required(),
    userId:Joi.string().required(),
    details: Joi.string(),
    postalcode: Joi.string(),
    paymentmethod: Joi.string().required(),
});

module.exports = {
   addressSchema,
    // SignupSchema
};