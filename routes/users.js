var express = require("express");
var router = express.Router();
const userController = require("../controllers/userControllers");
const pageController = require("../controllers/pageControllers");
const productController = require("../controllers/productControllers");
const middleware = require("../middleware/loginmiddleware");
const cartControllers = require("../controllers/cartControllers");
const userHelper = require("../helpers/userHelper");
const productHelper = require("../helpers/productHelper");
const adminHelper = require("../helpers/adminHelper");


// login route for user
router
  .route("/login")
  .get(userController.loginFunction)
  .post(userController.postLoginFunction);

// signup route for user
router
  .route("/signup")
  .get(userController.signupFunction)
  .post(userController.postSignupFunction);

// home route for user
router.get("/", pageController.landingPage);

router.route("/logout").get(userController.logout);

router.route("/shop").get(pageController.shoppingPage);

router.get("/edit-profile", pageController.profileEditing);

router.post("/edit-profile/:id", pageController.post_profileEditing);

router.route("/cart").get(cartControllers.cart);

router.route("/product-details/:id").get(productController.productDetails);

router.route("/add-to-cart/:id").get(cartControllers.addToCart);

router.route("/get-cart-products").get(cartControllers.cart);

router.route("/category/:id").get(pageController.applyCategory);

router.route("/view-category-products").get(pageController.applyCategory);

router
  .route("/reset-password")
  .get(pageController.resetPassword)
  .post(pageController.resetPassword_post);

router.route("/submit-otp").post(pageController.submitOtp);
router.route("/submit-otp-login").post(userController.submitOtpLogin);

router.post(
  "/change-product-quantity",
  cartControllers.changeProductQuantity
);

router.get("/otp-login", userController.otpLogin);
router.post("/otp-login", userController.otpLogin_post);

router.route("/update-password").post(pageController.updatePassword_post);

router.get("/checkout",middleware.verifyLoggin, cartControllers.checkout_get);
router.post("/checkout", cartControllers.checkout_post);

router.delete("/delete-cart-item", cartControllers.deleteCartItem);

router.get('/add-address', userController.addAddress)
router.put('/add-address/:id', userController.storeAddress)


router.get('/order-success', userController.orderSuccess)

router.post('/orders/razorpay-success', cartControllers.orderSuccess)

router.post('/verify-payment', userController.verifyPayment);
router.get("/manage-addresses", middleware.verifyLoggin, userController.showAddresses);

router.patch('/cancel-order/:id',middleware.verifyLoggin, userController.userCancelOrder)

module.exports = router;
