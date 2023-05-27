var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");
const pageController = require("../controllers/pageController");
const productController = require("../controllers/productController");
const middleware = require("../middleware/loginmiddleware");
const cartControllers = require("../controllers/cartController");
const wishlistController = require("../controllers/wishlistController");

// login route for user
router
  .route("/login")
  .get(userController.login)
  .post(userController.postLogin);

// signup route for user
router
  .route("/signup")
  .get(userController.signup)
  .post(userController.postSignup);

// home route for user
router.get("/", pageController.landingPage);

router.route("/logout").get(userController.logout);

router.route("/shop").get(pageController.shoppingPage);

router.get("/edit-profile", pageController.profileEditing);

router.post("/edit-profile/:id", pageController.post_profileEditing);

router.route("/cart", middleware.verifyLoggin).get(cartControllers.cart);

router.route("/product-details/:id").get(productController.productDetails);

router.route("/add-to-cart/:id").get(cartControllers.addToCart);

router.route("/get-cart-products").get(cartControllers.cart);

router.route("/category/:id").get(pageController.applyCategory);

router.route("/view-category-products").get(pageController.applyCategory);

router.get("/wishlist", middleware.verifyLoggin, wishlistController.wishlist);
router
  .route("/reset-password")
  .get(pageController.resetPassword)
  .post(pageController.resetPassword_post);

router.route("/submit-otp").post(pageController.submitOtp);
router.route("/submit-otp-login").post(userController.submitOtpLogin);

router.post("/change-product-quantity", cartControllers.changeProductQuantity);

router.get("/add-to-wishlist/:id", wishlistController.addToWishlist);

router.get("/otp-login", userController.otpLogin);
router.post("/otp-login", userController.otpLogin_post);

router.route("/update-password").post(pageController.updatePassword_post);

router.get("/checkout", middleware.verifyLoggin, cartControllers.checkout_get);
router.post(
  "/checkout",
  middleware.verifyLoggin,
  cartControllers.checkout_post
);

router.delete("/delete-cart-item", cartControllers.deleteCartItem);

router.delete("/delete-wishlist-item", wishlistController.deleteWishlistItem);


router.get("/add-address", userController.addAddress);
router.put("/add-address/:id", userController.storeAddress);

router.get("/orders", middleware.verifyLoggin, userController.orders_get);
router.get(
  "/order-success",
  middleware.verifyLoggin,
  userController.orderSuccess
);
router.post(
  "/orders/razorpay-success",
  middleware.verifyLoggin,
  cartControllers.orderSuccess
);

router.post("/verify-payment", userController.verifyPayment);
router.get(
  "/manage-addresses",
  middleware.verifyLoggin,
  userController.showAddresses
);

router.get(
  "/cancel-order/:id",
  middleware.verifyLoggin,
  userController.userCancelOrder
);

router.get(
  "/return-order/:id",
  middleware.verifyLoggin,
  userController.returnOrder
);

router.get("/download-invoice/:id", userController.downloadInvoice);


router.get("/search-item/", userController.search);
module.exports = router;
