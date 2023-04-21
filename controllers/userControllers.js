const userHelpers = require("../helpers/userHelper");
const createError = require("http-errors");
const authSchema = require("../models/authmodel");
const jwt = require("jsonwebtoken");
const resetPasswordAuth = require("../utils/twilio");
const { response } = require("express");
const productHelper = require("../helpers/productHelper");
const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "This is a very secret string", {
    expiresIn: maxAge,
  });
};

module.exports = {
  signupFunction: (req, res) => {
    res.render("users/signup", { signupErr: req.session.signupErr });
  },

  postSignupFunction: async (req, res) => {
    try {
      // var { error, value } = await authSchema.SignupSchema.validate(req.body);
      // if (error) throw createError.BadRequest('Invalid Credentials.');

      let response = await userHelpers.getUser(req.body);
      let { email, username, password, mobile } = req.body;
      if (response === null) {
        userHelpers
          .doSignup({ email, username, password, mobile })
          .then((response) => {
            if (response) {
              console.log(req.session.user);
              req.session.loggedIn = true;
              req.session.user = response;
              res.redirect("/");
            } else {
              res.redirect("/login");
            }
          });
      } else {
        throw createError.BadRequest("Already a user");
      }
    } catch (error) {
      res.send({
        error: {
          message: error.message,
        },
      });
    }
  },

  loginFunction: (req, res) => {
    if (req.session.user) {
      console.log(req.session.user);
      res.redirect("/");
    } else {
      req.session.loginErr = "";
      res.render("users/login", { userErr: req.session.loginErr });
    }
  },

  postLoginFunction: async (req, res, next) => {
    try {
      console.log(
        req.body,
        "================================================="
      );
      var { error, value } = await authSchema.LoginAuthSchema.validate(
        req.body
      );
      if (error) throw createError.BadRequest("Invalid Credentials.");

      let user = await userHelpers.getUser(value);
      if (!user) throw createError.BadRequest("user not registered.");

      if (!user.isAllowed) {
        throw createError.Forbidden("user is denied access");
      } else {
        let response = await userHelpers.doLogin(value);
        if (response.status) {
          // createToken(user._id)
          req.session.userLoggedIn = true;
          req.session.user = response.user;
          res.redirect("/");
        } else {
          throw createError.BadRequest("Invalid Credentials.");
        }
      }
    } catch (error) {
      console.log(error);
      req.session.loginErr = error;
      res.render("users/login", { userErr: req.session.loginErr });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },

  otpLogin: (req, res) => {
    res.render("users/reset-password", { otpLogin: true });
  },

  otpLogin_post: async (req, res) => {
    try {
      let user = await userHelpers.getUserByMobile(req.body.mobile);
      if (!user || !user.isAllowed)
        throw createError.NotFound("user not found");
      req.session.mobile = user.mobile;
      resetPasswordAuth.sendOtp(req.session.mobile);
      res.render("users/enter-otp", { otpLogin: true });
    } catch (error) {
      res.send({
        error: {
          status: "error.status",
          message: error.message,
        },
      });
    }
  },

  submitOtpLogin: async (req, res) => {
    console.log(req.session.mobile);
    let user = await userHelpers.getUserByMobile(req.session.mobile);
    req.session.user = user;
    let result = await resetPasswordAuth.verifyOtp(
      req.session.mobile,
      req.body.otp
    );
    if (!result) throw createHttpError.BadRequest("Wrong otp");
    else res.redirect("/");
  },

  addAddress: (req, res) => {
    res.render("users/add-address",{user: req.session.user, cartCount: req.session.cartCount});
  }


};
