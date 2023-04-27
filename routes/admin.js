var express = require("express");
var router = express.Router();
const cloudinary = require("../utils/cloundinary");
const upload = require("../utils/multer");
const adminController = require("../controllers/adminControllers");
const productController = require("../controllers/productControllers");
const productHelpers = require("../helpers/productHelper");
const middleware = require("../middleware/loginmiddleware");
const adminHelper = require("../helpers/adminHelper");


router.get(
  "/view-product",
  middleware.verifyAdmin,
  adminController.viewProducts
);

router.route("/")
.get(adminController.login)
.post(adminController.postLogin);

router.get(
  "/add-product",
  middleware.verifyAdmin,
  productController.AddProductFunc
);

router.get('/dashboard', adminController.getDashboard)

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

router.get("/unlist-product/:id", async(req, res) => {
  productHelpers.unListProduct(req.params.id).then((response) => {
    res.redirect("/admin/view-product");
  });
})

router.get("/list-product/:id", async(req, res) => {
  productHelpers.listProduct(req.params.id).then((response) => {
    res.redirect("/admin/view-product");
  });
})

router.patch("/block-user/:id", (req, res) => {
  adminHelper.blockUser(req.params.id);
  res.redirect("/admin/manage-user");
});

router.patch("/unblock-user/:id", (req, res) => {
  adminHelper.unBlockUser(req.params.id);
  res.redirect("/admin/manage-user");
});

router
  .route("/edit-product/:id", middleware.adminLoggedIn)
  .get(productController.editProduct)
  .post(productController.postEditProducts);

router.get("/add-category",middleware.verifyAdmin, adminController.addCategory_get)

router.post("/add-category",upload.array("Image"), adminController.addCategory_post)

router
  .route("/view-categories")
  .get(middleware.verifyAdmin, adminController.viewCategory);
  
router.get("/orders", middleware.verifyAdmin,adminController.getOrder);

router.get("/order-details/:id",middleware.verifyAdmin,adminController.orderDetails)

router.patch('/cancel-order/:id',middleware.verifyAdmin, adminController.cancelOrder)
module.exports = router;