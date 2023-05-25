const createHttpError = require('http-errors');
const adminHelper = require('../helpers/adminHelper');
const productHelpers = require('../helpers/productHelper');
const userHelpers = require('../helpers/userHelper');
const resetPasswordAuth = require('../utils/twilio');
let cartCount = 0;

module.exports = {
  // landing Page function.
  landingPage: async (req, res) => {
    let user = req.session.user;
    let banners = await adminHelper.getBanners()
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    let products=await productHelpers.getProducts()
      let category = adminHelper.getCategories()
      res.render('users/landing-page', { user, product: products, cartCount, category, banners});

  },

  // Profile Editing function.
   profileEditing: async(req, res) => {
    let user = req.session.user;
    if(user) {
      userHelpers.getUser(user).then((currentUser) => {
        res.render('users/edit-profile', { currentUser, cartCount, user: req.session.user, result: 0});
      });
    }else{
      res.redirect('/login');
    }
  },

  post_profileEditing: (req, res) => {
    userHelpers.updateUser(req.params.id, req.body).then(() => {
      req.session.user = req.body;
      res.redirect('/edit-profile');
    });
  },
  // shopping page function
  shoppingPage: async(req, res) => {
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    adminHelper.getCategories().then((category) => {
      productHelpers.getProducts().then((products) => {
        res.render('users/shop', { products, category, cartCount, user: req.session.user });
      });
    });
  },

  // Cart function.

  applyCategory: (req, res) => {
    adminHelper.getCategories().then(async(category) => {
      let user = req.session.user;
      if(req.session.userLoggedIn){
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }else{
        cartCount = 0;
      }
      productHelpers.getCategory(req.params.id).then((result) => {
        res.render('users/categorised-view', { result, category, user, cartCount});
      });
    });
  },

  resetPassword: (req, res) => {
    res.render('users/reset-password', {otpLogin: false});
  },

  resetPassword_post: async(req, res) => {
    try{
      let user = await userHelpers.getUserByMobile(req.body.mobile)
      if(!user || !user.isAllowed) throw createHttpError.NotFound('user not found');
      req.session.mobile = user.mobile;
      resetPasswordAuth.sendOtp(req.body.mobile)
      res.render('users/enter-otp',{otpLogin: false});
    }catch(error){
      res.send(error)
    }
  },

  submitOtp: async(req, res) => {
    try {
      let user = await userHelpers.getUserByMobile(req.session.mobile)
      // req.session.user = user
      let result = await resetPasswordAuth.verifyOtp(req.session.mobile, req.body.otp)
      if(!result) throw createHttpError.BadRequest('Wrong otp');
      else res.render('users/new-password');
    } catch (error) {
      res.send(error.message);
    }
  },


  updatePassword_post: async(req, res) =>{
    try {
      let password = req.body.password;
      let user = await userHelpers.getUserByMobile(req.session.mobile);
      let result = await userHelpers.updatePassword(user._id, password).then((result) => {
      res.redirect('/login')
      })
    } catch (error) {
      res.send(error.message)
    }
  }
  
};
