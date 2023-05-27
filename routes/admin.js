var express = require("express");
var router = express.Router();
const upload = require("../utils/multer");
const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const productHelpers = require("../helpers/productHelper");
const middleware = require("../middleware/loginmiddleware");
const adminHelper = require("../helpers/adminHelper");

router.get(
  "/view-product",
  middleware.verifyAdmin,
  adminController.viewProducts
);

router.route("/").get(adminController.login).post(adminController.postLogin);

router.get(
  "/add-product",
  middleware.verifyAdmin,
  productController.AddProduct
);
  
router.get("/dashboard",middleware.verifyAdmin, adminController.getDashboard);

router.post(
  "/add-product",
  upload.array("Image"),
  productController.postAddProduct
);

router.get("/manage-user", middleware.verifyAdmin, (req, res) => {
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/manage-user", { users });
  });
});

router.get("/unlist-product/:id", async (req, res) => {
  productHelpers.unListProduct(req.params.id).then(() => {
    res.redirect("/admin/view-product");
  });
});

router.get("/list-product/:id", async (req, res) => {
  productHelpers.listProduct(req.params.id).then(() => {
    res.redirect("/admin/view-product");
  });
});

router.get("/list-category/:id", async (req, res) => {
  adminHelper.listCategory(req.params.id).then(() => {
    res.redirect("/admin/view-categories");
  });
});

router.get("/unlist-category/:id", async (req, res) => {
  adminHelper.unlistCategory(req.params.id).then(() => {
    res.redirect("/admin/view-categories");
  });
});

router.patch("/block-user/:id", (req, res) => {
  adminHelper.blockUser(req.params.id);
  res.redirect("/admin/manage-user");
});

router.patch("/unblock-user/:id", (req, res) => {
  adminHelper.unBlockUser(req.params.id);
  res.redirect("/admin/manage-user");
});

router.get("/banners",middleware.verifyAdmin, adminController.viewBanners);
router.post("/banners",middleware.verifyAdmin, upload.array("Image"), adminController.addBanner);
router.get("/delete-banner/:id", adminController.deleteBanner);

router
  .route("/edit-product/:id", middleware.adminLoggedIn)
  .get(productController.editProduct)
  .post(upload.array("Image"), productController.postEditProducts);

router.post(
  "/add-category",
  upload.array("Image"),
  adminController.addCategory_post
);

router
  .route("/view-categories")
  .get(middleware.verifyAdmin, adminController.viewCategory);

router.get("/orders", middleware.verifyAdmin, adminController.getOrder);
router.post(
  "/edit-category",
  middleware.verifyAdmin,
  adminController.editCategory_post
);

router.get(
  "/order-details/:id",
  middleware.verifyAdmin,
  adminController.orderDetails
);

router.patch(
  "/cancel-order/:id",
  middleware.verifyAdmin,
  adminController.adminCancelOrder
);
router.patch(
  "/delivered-order/:id",
  middleware.verifyAdmin,
  adminController.deliveredOrder
);

router.get("/coupons", middleware.verifyAdmin, adminController.getCoupons);
router.post("/create-code", middleware.verifyAdmin, adminController.createCode);
router.patch(
  "/list-coupon/:id",
  middleware.verifyAdmin,
  adminController.listCoupon
);

router.patch(
  "/unlist-coupon/:id",
  middleware.verifyAdmin,
  adminController.unlistCoupon
);

router.get("/verify-coupon/:id", adminController.verifyCoupon);

router.get('/sales-report', adminController.salesReport);
router.get('/logout',middleware.verifyAdmin, adminController.logout)
module.exports = router;
