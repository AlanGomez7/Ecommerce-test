const userHelpers = require("../helpers/userHelper");
const productHelpers = require("../helpers/productHelper");
const adminHelpers = require("../helpers/adminHelper");
const createHttpError = require("http-errors");
let wishlistCount = 0;

module.exports = {

    wishlist: async(req, res) => {

        let isInStock = true;
        if (req.session.userLoggedIn) {
          cartCount = await userHelpers.getCartCount(req.session.user._id);
          let products = await productHelpers.getWishlistProducts(req.session.user._id);
          console.log(products)
          for (let i = 0; i < products.length; i++) {
            if (products[i].product.stock == 0) {
              isInStock = false;
            }
          }
          if (products.length == 0) {
            res.render("users/emptycart");
          } else {
            let total = 0
            res.render("users/wishlist", {
              products,
              user: req.session.user,
              cartCount,
              isInStock,
            });
          }
        } else {
          res.redirect("/login");
        } 
    },
    addToWishlist:(req, res)=>{
        if (req.session.user) {
            productHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
              res.json({ status: true });
            });
          } else {
            res.json({ status: false });
          }
    },

    deleteWishlistItem:(req, res)=>{
        console.log(req.body);
        userHelpers.deleteWishlistProduct(req.body).then((response) => {
          res.send(response);
        });
        
    },
}