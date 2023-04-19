const Joi = require("joi");

const LoginAuthSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
});

// const SignupSchema = Joi.object({
//   username : Joi.string().required(),
//   email: Joi.string().email().lowercase().required(),
//   mobile:Joi.string().length(10).required(),
//   password: Joi.string().min(8).required()
// })

module.exports = {
  LoginAuthSchema,
  // SignupSchema
};
