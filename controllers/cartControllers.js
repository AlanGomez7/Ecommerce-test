const userHelpers = require("../helpers/userHelper");
const addressSchema = require("../models/addressModel");
const productHelpers = require('../helpers/productHelper');
const createHttpError = require("http-errors");
var cartCount = 0

module.exports = {

  checkout_get: async (req, res) => {
    try{
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      if(total.length === 0)throw createHttpError.NotFound('Cart is empty')
      var address = await userHelpers.getAddress(req.session.user._id);
      res.render("users/checkout", { user: req.session.user, total: total[0].total, address, cartCount});
    }catch(err){
      res.send(err)
    }
  },

  addToCart: async(req, res) => {
    if(req.session.user) {
      productHelpers.addToCart(req.params.id, req.session.user._id).then(() => {     
        res.json({status: true});
      });
    }else{
      res.json({status: false});
    }
  },

  checkout_post: async (req, res) => {
    console.log(req.body, "++++++++++++++++++++++++++")
    try {
      var cartProducts = await userHelpers.getCartProductList(req.body.userId);
      if(cartProducts.length > 0){
        var address = await userHelpers.getAddress(req.body.userId)
        var total = await userHelpers.getTotalAmount(req.body.userId);
        userHelpers.placeOrder(address[req.body.selectedaddress], cartProducts, total[0].total, req.body).then((response) => {
          if(req.body.paymetmethod === 'COD'){
            res.json({codSuccess: true})
          }else{
            userHelpers.generateRazorpay(response.insertedId, total)
          }
        });
        userHelpers.deleteCart(req.body.userId)
      }else{
        console.log('cart is empty')
      }
    } catch (err) {
      res.send(err);
    }
  },

  changeProductQuantity: (req, res) => {
    userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelper.getTotalAmount(req.body.userId)
     res.json(response)
    })
  },

  cart: async (req, res) => {
    if (req.session.userLoggedIn) {
      console.log(req.session.userLoggedIn)
      let products = await productHelpers.getCartProducts(req.session.user._id);
      if(products.length == 0) {
        res.render('users/emptycart')
      }else{
        let total = await userHelpers.getTotalAmount(req.session.user._id);
        res.render('users/cart', { products, user: req.session.user, cartCount, total: total[0].total });
      }

    } else {
      res.redirect('/login');
    }
  },

  deleteCartItem: async (req, res) => {
    console.log(req.body);
    userHelpers.deleteCartProduct(req.body).then((response) => {
      res.send(response);
    });
  },
};
