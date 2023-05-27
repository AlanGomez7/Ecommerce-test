const userHelpers = require("../helpers/userHelper");
const productHelpers = require("../helpers/productHelper");
const adminHelpers = require("../helpers/adminHelper");
const createHttpError = require("http-errors");
const sendmail = require('../utils/nodeMailer');
let cartCount = 0;

module.exports = {
  checkout_get: async (req, res) => {
    try {
      console.log('cart')
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      if (total.length === 0) throw createHttpError.NotFound("Cart is empty");
      var address = await userHelpers.getAddress(req.session.user._id);
      if (address === undefined) {
        res.render("users/checkout", {
          user: req.session.user,
          total: total[0].total,
          cartCount,
          hasAddress: false,
          currentUser: req.session.user,
        });
      } else {
        res.render("users/checkout", {
          user: req.session.user,
          total: total[0].total,
          address,
          cartCount,
          hasAddress: true,
          currentUser: req.session.user,
        });
      }
    } catch (err) {
      if (err.message == "Cart is empty") {
        res.redirect("/cart");
      }
    }
  },

  addToCart: async (req, res) => {
    if (req.session.user) {
      productHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
        res.json({ status: true });
      });
    } else {
      res.json({ status: false });
    }
  },

  checkout_post: async (req, res) => {
    try {
      if (req.body.selectedaddress == undefined) {
        throw new Error("Please select an Address");
      }
      var cartProducts = await userHelpers.getCartProductList(req.body.userId);

      for (let i = 0; i < cartProducts.length; i++) {
        userHelpers.decreaseStock(
          cartProducts[i].item,
          cartProducts[i].quantity
        );
      }
      if (cartProducts.length > 0) {
        var address = await userHelpers.getAddress(req.body.userId);
        userHelpers
          .placeOrder(
            address[req.body.selectedaddress],
            cartProducts,
            req.body.orderTotal,
            req.body
          )
          .then((response) => {
            req.session.currentOrder = response.insertedId;
            if (req.body.paymentmethod == "COD") {
              res.send({ codSuccess: true });
            } else if (req.body.paymentmethod == "wallet") {
              if (req.session.user.wallet >= parseInt(req.body.orderTotal)) {
                userHelpers.walletPayment(req.body, req.body.orderTotal);
                res.json({
                  walletSuccess: true,
                  message: "Payment successful",
                });
              } else {
                res.json({ walletPayment: false });
              }
            } else if (req.body.paymentmethod == "onlinePayment") {
              userHelpers
                .generateRazorpay(response.insertedId, +req.body.orderTotal)
                .then((response) => {
                  response.onlinepayment = true;
                  res.json(response);
                });
            }
          });
      } else {
        res.redirect("/cart");
      }
    } catch (err) {
      res.json({ error: err.message });
    }
  },

  changeProductQuantity: (req, res) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      let total = await userHelpers.getTotalAmount(req.body.userId);
      response.total = total[0].total;
      res.json(response);
    });
  },

  cart: async (req, res) => {
    let isInStock = true;
    if (req.session.userLoggedIn) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      let products = await productHelpers.getCartProducts(req.session.user._id);
      for (let i = 0; i < products.length; i++) {
        if (products[i].product.stock == 0) {
          isInStock = false;
        }
      }
      if (products.length == 0) {
        res.render("users/emptycart", {cartCount, user: req.session.user});
      } else {
        let total = await userHelpers.getTotalAmount(req.session.user._id);
        res.render("users/cart", {
          products,
          user: req.session.user,
          cartCount,
          isInStock,
          total: total[0].total,
        });
      }
    } else {
      res.redirect("/login");
    }
  },

  deleteCartItem: async (req, res) => {
    userHelpers.deleteCartProduct(req.body).then((response) => {
      res.send(response);
    });
  },

  orderSuccess: async (req, res, err) => {
    if (!req.body.razorpay_signature) {
      res.redirect("/checkout");
    } else {
      userHelpers.deleteCart(req.session.user._id);
      let order = await adminHelpers.orderDetails(req.session.currentOrder);
      let products = await adminHelpers.getOrderProducts(
        req.session.currentOrder
      );
      userHelpers.changeStatus(order[0]._id).then((res) => {});
      // SENDING CONFIRMATION MAIL TO THE USER
      sendmail.mailOptions.to = req.session.user.email;
      sendmail.sendMail();
      res.render("users/order-confirmed", { order, products, user: req.session.user, cartCount });
    }
  },
};
