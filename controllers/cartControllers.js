const userHelpers = require("../helpers/userHelper");
const productHelpers = require('../helpers/productHelper');
const adminHelpers = require('../helpers/adminHelper');
const createHttpError = require("http-errors");
var cartCount = 0

module.exports = {

  checkout_get: async (req, res) => {
    try{
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      if(total.length === 0)throw createHttpError.NotFound('Cart is empty')
      var address = await userHelpers.getAddress(req.session.user._id);

      if(address === undefined){
        res.render("users/checkout", {
           user: req.session.user,
           total: total[0].total,
           cartCount,
           hasAddress: false,
           currentUser: req.session.user
        });
      }else{
        res.render("users/checkout", { 
          user: req.session.user, 
          total: total[0].total,
          address, cartCount, 
          hasAddress : true, 
          currentUser: req.session.user
        }); 
      }
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
    try {
      var cartProducts = await userHelpers.getCartProductList(req.body.userId);
      if(cartProducts.length > 0){
        var address = await userHelpers.getAddress(req.body.userId)
        var total = await userHelpers.getTotalAmount(req.body.userId);
        userHelpers.placeOrder(address[req.body.selectedaddress], cartProducts, req.body.orderTotal, req.body).then((response) => {
          req.session.currentOrder = response.insertedId;

          if(req.body.paymentmethod === 'COD'){
           res.send({codSuccess: true})
          }else{
            userHelpers.generateRazorpay(response.insertedId, total).then((response) => {
              res.json(response)
            })
          }

        });
      }else{
        console.log('cart is empty')
      }
    } catch (err) {
      res.send(err);
    }
  },

  changeProductQuantity: (req, res) => {
    userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    let total = await userHelpers.getTotalAmount(req.body.userId)
    response.total = total[0].total
     res.json(response)
    })
  },

  cart: async (req, res) => {
    if (req.session.userLoggedIn) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
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

  orderSuccess: async(req, res, err) =>{
    console.log(req.body);
    if(!req.body.razorpay_signature){
      res.redirect('/chekout')
    }else{
      userHelpers.deleteCart(req.session.user._id)
      let order = await adminHelpers.orderDetails(req.session.currentOrder);
      let products = await adminHelpers.getOrderProducts(req.session.currentOrder);
      console.log(order)
      userHelpers.changeStatus(order[0]._id).then(res=>{
        
      })
      res.render('users/order-confirmed', {order, products})
    }
  }

};
