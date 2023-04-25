const adminHelper = require('../helpers/adminHelper');
const productHelpers = require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');
var objectId = require('mongodb').ObjectId;
const cloudinary = require('../utils/cloundinary');
const upload = require('../utils/multer');
const { response } = require('express');
var objectId = require('mongodb').ObjectId;

module.exports = {
  productDetails: async (req, res) => {
    console.log(req.session.user)
    let product = await productHelpers.getProductDetails(req.params.id);
    console.log(product);
    res.render('users/product-details', { product, user: req.session.user, cartCount: req.session.cartCount });
  },

  editProduct: async (req, res) => {
    console.log(req.params.id, "----------------------------------");
    let category = await adminHelper.getCategories()
    let product = await productHelpers.getProductDetails(req.params.id);
    res.render('admin/edit-product', { product , categories: category});
  },

  postEditProducts: async (req, res) => {
    req.body.price = +req.body.price;
    productHelpers.updateProducts(req.params.id, req.body).then(() => {
      res.redirect('/admin/view-product');
    });
  },

  AddProductFunc: (req, res) => {
    adminHelper.getCategories().then((categories) => {
      res.render('admin/add-product', { categories });
    });
  },

  postAddProduct: async (req, res) => {

    try {
      req.body.stock = +req.body.stock;
      req.body.price = +req.body.price;
      console.log(req.file);
      const imgUrl = [];
      
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        imgUrl.push(result.url);
      }
      productHelpers.addProducts(req.body, async (id) => {
        productHelpers.addProductImages(id, imgUrl).then((response) => {
        });
      });
    } catch (err) {
      // console.log(err);
    } finally {
      req.session.submitStatus = 'product Added';
      res.redirect('/admin/view-product');
    }
  },

  deleteProducts: (req, res) => {
    let proId = req.params.id;
    productHelpers.deleteProduct(proId).then((response) => {
      res.redirect('/admin/view-product');
    });
  },
};
