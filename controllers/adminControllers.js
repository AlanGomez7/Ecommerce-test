var express = require('express');
var router = express.Router();
const cloudinary = require('../utils/cloundinary');
const upload = require('../utils/multer');
var objectId = require('mongodb').ObjectId
const createError = require('http-errors');
const adminHelpers = require('../helpers/adminHelper')
const productHelpers = require('../helpers/productHelper');
const authSchema = require('../models/authmodel');
const Joi = require('joi');
const userHelper = require('../helpers/userHelper');

module.exports = {
     
    login:(req, res, next) => {
        if(req.session.admin){
          res.redirect('/admin')
        }else{
          let err = ''
          res.render('admin/admin-login', {err})
          req.session.adminLoginErr = false
        }
    },

    postLogin:async (req, res, next) => {
      try{
        var { error, value } = await authSchema.LoginAuthSchema.validate(req.body);
        if (error) throw createError.BadRequest('Invalid Credentials.');
          let response = await adminHelpers.doLogin(value)
            if(response.status){
              req.session.adminLoggedIn=true
              req.session.admin=response.admin 
              
              res.redirect('/admin/view-product')
            }else{
              throw createError.BadRequest('User not an administrator')
              
            }
  
          
      }catch(err){
        res.render('admin/admin-login', {err})
      }
    },

    viewProducts : (req, res) =>{
      productHelpers.getAllProducts().then((products)=>{
        // let msg = ''
        res.render('admin/view-product', {products});
      })
          
    },

    addCategory_get:(req, res)=>{
      res.render('admin/add-category');
    },

   addCategory_post: async (req, res) => {
    console.log(req.body);
    try {
      
      const imgUrl = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        imgUrl.push(result.url);
      
      }
      adminHelpers. addCategory(req.body, async (id) => {
        console.log(id)
        productHelpers.addCategoryImages(id, imgUrl).then((response) => {
          // console.log(response);
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      req.session.submitStatus = 'category Added';
      res.redirect('/admin/add-category');
    }
  },

     viewCategory: (req, res)=>{
      adminHelpers.getCategories().then((categories)=>{
        console.log(categories);
        res.render('admin/view-categories', {categories})
      })
     },

     getOrder: async(req, res) => {
      let orders = await adminHelpers.getOrders().then((orders)=>{
        console.log(orders);
        res.render('admin/order', {orders})
      })
    },

    orderDetails: async(req, res) => {
        console.log(req.params.id)
        let orderDetails = await adminHelpers.getOrderDetails(req.params.id)
        let products = await adminHelpers.getOrderProducts(req.params.id)
        console.log(orderDetails)
        res.render('admin/order-details', {products, orderDetails}) 
    },

    cancelOrder: async(req, res) => {
      console.log(req.params.id);
      adminHelpers.cancelOrder(req.params.id).then((response) => {
        res.send(response)
      });
    }

}