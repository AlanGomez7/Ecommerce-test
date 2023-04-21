const userHelpers = require("../helpers/userHelper");
const addressSchema = require("../models/addressModel");

module.exports = {

  checkout_get: async (req, res) => {
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("users/checkout", { user: req.session.user, total });
  },

  addToCart: (req, res) => {
    
    if(req.session.user) {
      productHelpers.addToCart(req.params.id, req.session.user._id).then(() => {     
        res.json({status: true});
      });

    }else{
      res.json({status: false});
    }
  },

  checkout_post: async (req, res) => {
    try {
      req.body.paymentmethod = "COD";
      console.log(req.body);
      let { error, value } = await addressSchema.addressSchema.validate(
        req.body
      );
      if (error) throw error;
      var cartProducts = await userHelpers.getCartProductList(req.body.userId);
      var total = await userHelpers.getTotalAmount(req.body.userId);
      userHelpers.placeOrder(req.body, cartProducts, total).then((response) => {
        res.render("users/order-confirmed");
      });

      console.log(req.body, total, cartProducts);
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
        res.render('users/cart', { products, user: req.session.user, cartCount, total });
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
