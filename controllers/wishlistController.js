const userHelpers = require("../helpers/userHelper");
const productHelpers = require("../helpers/productHelper");

module.exports = {
  wishlist: async (req, res) => {
    let cartCount;
    let isInStock = true;
    if (req.session.userLoggedIn) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      let products = await productHelpers.getWishlistProducts(req.session.user._id);
      for (let i = 0; i < products.length; i++) {
        if (products[i].product.stock == 0) {
          isInStock = false;
        }
      }
      if (products.length == 0) {
        res.render("users/emptywishlist", { user: req.session.user, cartCount });
      } else {
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
  addToWishlist: (req, res) => {
    if (req.session.user) {
      productHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
        res.json({ status: true });
      });
    } else {
      res.json({ status: false });
    }
  },

  deleteWishlistItem: (req, res) => {
    userHelpers.deleteWishlistProduct(req.body).then((response) => {
      res.send(response);
    });

  },
}