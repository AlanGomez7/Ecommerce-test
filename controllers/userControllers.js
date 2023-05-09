const userHelpers = require("../helpers/userHelper");
const createError = require("http-errors");
const authSchema = require("../models/authmodel");
const addressSchema = require("../models/addressModel");
const adminHelpers = require("../helpers/adminHelper");
const jwt = require("jsonwebtoken");
const resetPasswordAuth = require("../utils/twilio");
const { use } = require("../routes/users");
let crypto = require("crypto");
const productHelper = require("../helpers/productHelper");
const maxAge = 3 * 24 * 60 * 60;
let cartCount = 0;
const createToken = (id) => {
  return jwt.sign({ id }, "This is a very secret string", {
    expiresIn: maxAge,
  });
};

module.exports = {
  signupFunction: (req, res) => {
    let error = ""
    res.render("users/signup", { error });
  },

  postSignupFunction: async (req, res) => {
    try {
      var { error, value } = await authSchema.SignupSchema.validate(req.body);
      if (error) throw createError.BadRequest("Invalid inputs")

      let response = await userHelpers.getUser(req.body);
      let uniqueId = crypto.randomUUID();
      let wallet=0;
      value.uniqueId = uniqueId;
      value.isAllowed = true; 
      value.wallet = wallet;
      if (response === null) {
        userHelpers
          .doSignup(value)
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
      if(error){
        res.render('users/signup', {error: error.message});
      }
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
        console.log(value, "================================")
        let response = await userHelpers.doLogin(value);
        if (response.status) {
          console.log(response.user, "================================]")
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
    try{
      console.log(req.session.mobile);
      let result = await resetPasswordAuth.verifyOtp(
        req.session.mobile,
        req.body.otp
      );
      console.log(result, 'result+++++++++')
      if (!result){
        throw createHttpError.BadRequest("Wrong otp");
      }else{
        req.session.userLoggedIn = true;
        let user = await userHelpers.getUserByMobile(req.session.mobile);
        req.session.user = user;
        res.redirect("/");
      } 
      
    }catch(e){
      req.session.wrongOtp = e.message
      res.redirect("/otp-login");
    }
  },

  addAddress: async (req, res) => {
    let user = req.session.user;
    if(user) {
      userHelpers.getUser(user).then((currentUser) => {
        res.render('users/add-address',{ currentUser, cartCount, user: req.session.user, result: 0});
      });

    }else{
      res.redirect('/login');
    }
  },

  storeAddress: async (req, res) => {
    try {
      console.log(req.body)
      var {error, value} = await addressSchema.addressSchema.validate(req.body);
      if(error) throw new Error(error);
      userHelpers.addAddress(value, req.params.id).then((response) => {
        res.send(response)
      })
    } catch (error) {
      res.send(error) 
    }
  },
  showAddresses: async(req, res)=>{
    console.log(req.session.user._id)
    let addresses = await userHelpers.getAddress(req.session.user._id);
    console.log(addresses)
    if(addresses=== undefined){
      res.redirect('add-address')
    }else{
      res.render('users/view-address', {user: req.session.user, address: addresses})
    }
  },

  verifyPayment: (req, res) => {
    console.log(req.body, "ord")
    userHelpers.verifyPayment(req.body).then((response) => {
      console.log('success')
      userHelpers.changeStatus(req.body.order.receipt).then(()=>{
        res.json({status: true})
      }) 
    }).catch((err) => {
      console.log(err)
      res.json({status: false, message: err.message})
    })
  },

  userCancelOrder: async (req, res) => {
    console.log(req.params.id);
    let order = await adminHelpers.orderDetails(req.params.id)
    console.log(order)
    adminHelpers.cancelOrder(req.params.id).then((response) => {
      if(order[0].status === "Placed" && order.paymentMethod !== "COD"){
        adminHelpers.returnMoney(order[0].userId, order[0].total)
      }
      res.redirect('/orders');
    });
  },
  
  orderSuccess: async(req, res) => {
    console.log(req.session.user._id)
    let order = await adminHelpers.orderDetails(req.session.currentOrder);
    let products = await adminHelpers.getOrderProducts(req.session.currentOrder);
    userHelpers.deleteCart(req.session.user._id)
    res.render('users/order-confirmed', {order, products})
  },
  orders_get: async(req, res) => {
    let products = await adminHelpers.userOrderedProducts(req.session.user._id);
    let order = await adminHelpers.getOrderDetails(req.session.user._id);

    console.log(products)
    res.render('users/orders', {products, order})
  }
};
 