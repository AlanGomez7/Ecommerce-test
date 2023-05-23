const crypto = require("crypto");
const bindHelper = require("../helpers/orderHelper");
const userHelpers = require("../helpers/userHelper");
const createError = require("http-errors");
const authSchema = require("../models/authmodel");
const addressSchema = require("../models/addressModel");
const adminHelpers = require("../helpers/adminHelper");
const resetPasswordAuth = require("../utils/twilio");
const adminHelper = require("../helpers/adminHelper");
const productHelper = require("../helpers/productHelper");
const sendMail  = require("../utils/nodeMailer");
let cartCount = 0;

module.exports = {
  signup: (req, res) => {
    let error = "";
    res.render("users/signup", { error });
  },

  postSignup: async (req, res) => {
    try {
      var { error, value } = await authSchema.SignupSchema.validate(req.body);
      if (error) throw createError.BadRequest("Invalid inputs");

      let response = await userHelpers.getUser(req.body);
      let uniqueId = crypto.randomUUID();
      let wallet = 0;
      value.uniqueId = uniqueId;
      value.isAllowed = true;
      value.wallet = wallet;
      if (response === null) {
        userHelpers.doSignup(value).then((response) => {
          if (response) {
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
      if (error) {
        res.render("users/signup", { error: error.message });
      }
    }
  },

  login: (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      req.session.loginErr = "";
      res.render("users/login", { userErr: req.session.loginErr });
    }
  },

  postLogin: async (req, res, next) => {
    try {
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
          req.session.userLoggedIn = true;
          req.session.user = response.user;
          cartCount = await userHelpers.getCartCount(req.session.user._id);
          res.redirect("/");
        } else {
          throw createError.BadRequest("Invalid Credentials.");
        }
      }
    } catch (error) {
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
      res.render("users/enter-otp", { otpLogin: true, wrongOtp: "" });
    } catch (error) {
      res.send({
        error: {
          status: error.status,
          message: error.message,
        },
      });
    }
  },

  submitOtpLogin: async (req, res) => {
    try {
      let result = await resetPasswordAuth.verifyOtp(
        req.session.mobile,
        req.body.otp
      );

      if (!result) {
        throw createHttpError.BadRequest("Wrong otp");
      } else {
        req.session.userLoggedIn = true;
        let user = await userHelpers.getUserByMobile(req.session.mobile);
        req.session.user = user;
        res.redirect("/");
      }
    } catch (e) {
      req.session.wrongOtp = e.message;
      res.redirect("/otp-login");
    }
  },

  addAddress: async (req, res) => {
    let user = req.session.user;
    if (user) {
      userHelpers.getUser(user).then((currentUser) => {
        res.render("users/add-address", {
          currentUser,
          cartCount,
          user: req.session.user,
          result: 0,
        });
      });
    } else {
      res.redirect("/login");
    }
  },

  storeAddress: async (req, res) => {
    try {
      var { error, value } = await addressSchema.addressSchema.validate(
        req.body
      );
      if (error) throw new Error(error);
      userHelpers.addAddress(value, req.params.id).then((response) => {
        res.send(response);
      });
    } catch (error) {
      res.send(error);
    }
  },
  showAddresses: async (req, res) => {
    let addresses = await userHelpers.getAddress(req.session.user._id);
    if (addresses === undefined) {
      res.redirect("add-address");
    } else {
      res.render("users/view-address", {
        user: req.session.user,
        address: addresses,
      });
    }
  },

  verifyPayment: (req, res) => {
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        console.log("success");
        userHelpers.changeStatus(req.body.order.receipt).then(() => {
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, message: err.message });
      });
  },

  userCancelOrder: async (req, res) => {
    let order = await adminHelpers.orderDetails(req.params.id);
    adminHelpers.cancelOrder(req.params.id).then((response) => {
      if (order[0].status === "Placed" && order.paymentMethod !== "COD") {
        adminHelpers.returnMoney(order[0].userId, order[0].total);
      }
      res.redirect("/orders");
    });
  },

  orderSuccess: async (req, res) => {
    let order = await adminHelpers.orderDetails(req.session.currentOrder);
    let products = await adminHelpers.getOrderProducts(
      req.session.currentOrder
    );
    sendMail.mailOptions.to = req.session.user.email;
    sendMail.sendMail();
    userHelpers.deleteCart(req.session.user._id);
    res.render("users/order-confirmed", { order, products, user: req.session.user, cartCount });
  },

  orders_get: async (req, res) => {
    let product = await adminHelpers.userOrderedProducts(req.session.user._id);
    let order = await adminHelpers.getOrderDetails(req.session.user._id);
    let products = bindHelper.bindOrderDetails(order, product);
    console.log(products)
    res.render("users/orders", { products, order, user: req.session.user, cartCount});
  },

  search: async (req, res) => {
    let category = await adminHelper.getCategories();
    let products = await productHelper.searchProducts(req.query.search);

    res.render("users/shop", {
      products,
      category,
      cartCount,
      user: req.session.user,
    });
  },

  returnOrder: async (req, res) => {
    let order = await adminHelper.orderDetails(req.params.id);
    adminHelper.returnOrder(req.params.id).then((response) => {
      if (order[0].status === "Delivered" && order.paymentMethod !== "COD") {
        adminHelper.returnMoney(order[0].userId, order[0].total);
      }
      res.redirect("/orders");
    });
  },
};
