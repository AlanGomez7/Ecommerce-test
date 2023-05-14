const adminHelper = require('../helpers/adminHelper');
const productHelpers = require('../helpers/productHelper');
const cloudinary = require('../utils/cloundinary');
const productSchema = require('../models/productModel');


const crypto = require('crypto');
const Joi = require('joi');

module.exports = {
  
  productDetails: async (req, res) => {
    console.log(req.session.user)
    let product = await productHelpers.getSingleProduct(req.params.id);
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
    console.log(req.body.price)
   try{
    const imgUrl = [];
    for (let i = 0; i <req.files.length; i++) {
      const result = await cloudinary.uploader.upload(req.files[i].path);
      imgUrl.push(result.url);
      console.log(result.url);
    }
    productHelpers.updateProducts(req.params.id, req.body).then(() => {
      if(imgUrl.length != 0) {
        productHelpers.addProductImages(req.params.id, imgUrl).then((response)=>{
          console.log(response)
        })
      }
    })

   }catch(err){
    console.log(err);
   }finally{
    res.redirect('/admin/view-product');
   }
  },

  AddProduct: (req, res) => {
    let error = req.session.productErr;
    adminHelper.getCategories().then((categories) => {
      res.render('admin/add-product', { categories, error });
    });
  },

  postAddProduct: async (req, res) => {
    try {
      req.body.stock = +req.body.stock;
      req.body.price = +req.body.price;
      req.body.uniqueId = crypto.randomBytes(8).toString('hex')
      const {error, value} = await productSchema.productSchema.validate(req.body);
      if(error) throw new Error(error)
      const imgUrl = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        imgUrl.push(result.url);
      }
      productHelpers.addProducts(value, async (id) => {
        productHelpers.addProductImages(id, imgUrl).then((response) => {
        });
      });
    } catch (err) {
      req.session.productErr = err.message;
      res.redirect('/admin/ add-product')
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
