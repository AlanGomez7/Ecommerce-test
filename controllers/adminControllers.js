var express = require("express");
var router = express.Router();
const cloudinary = require("../utils/cloundinary");
const upload = require("../utils/multer");
var objectId = require("mongodb").ObjectId;
const createError = require("http-errors");
const adminHelpers = require("../helpers/adminHelper");
const productHelpers = require("../helpers/productHelper");
const authSchema = require("../models/authmodel");
const Joi = require("joi");
const userHelper = require("../helpers/userHelper");

module.exports = {
  login: (req, res, next) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      let err = "";
      res.render("admin/admin-login", { err });
      req.session.adminLoginErr = false;
    }
  },

  postLogin: async (req, res, next) => {
    try {
      var { error, value } = await authSchema.LoginAuthSchema.validate(
        req.body
      );
      if (error) throw createError.BadRequest("Invalid Credentials.");
      let response = await adminHelpers.doLogin(value);
      if (response.status) {
        req.session.adminLoggedIn = true;
        req.session.admin = response.admin;

        res.redirect("/admin/view-product");
      } else {
        throw createError.BadRequest("User not an administrator");
      }
    } catch (err) {
      res.render("admin/admin-login", { err });
    }
  },

  viewProducts: (req, res) => {
    productHelpers.getAllProducts().then((products) => {
      console.log(products, "|||||||||||||||||||||||");
      res.render("admin/view-product", { products });
    });
  },

  addCategory_get: (req, res) => {
    res.render("admin/add-category");
  },

  addCategory_post: async (req, res) => {
    console.log(req.body);
    try {
      const imgUrl = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        imgUrl.push(result.url);
      }
      adminHelpers.addCategory(req.body, async (id) => {
        console.log(id);
        productHelpers.addCategoryImages(id, imgUrl).then((response) => {
          // console.log(response);
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      req.session.submitStatus = "category Added";
      res.redirect("/admin/add-category");
    }
  },

  viewCategory: (req, res) => {
    adminHelpers.getCategories().then((categories) => {
      console.log(categories);
      res.render("admin/view-categories", { categories, banners: false });
    });
  },

  getOrder: async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const skip = (page - 1) * pageSize;

    let orders = await adminHelpers.getOrders(skip, pageSize)
    const count = await adminHelpers.findOrderCount();   

    const totalPages = Math.ceil(count / pageSize);
    const currentPage = page > totalPages ? totalPages : page;
      
    
    res.render("admin/order", { orders, totalPages,currentPage,pageSize, result: 0 });
    
  },

  orderDetails: async (req, res) => {
    let orderDetails = await adminHelpers.orderDetails(req.params.id);
    let products = await adminHelpers.getOrderProducts(req.params.id);
    console.log(orderDetails);
    res.render("admin/order-details", {
      products,
      orderDetails,
      orderId: products[0]._id,
    });
  },

  adminCancelOrder: async (req, res) => {
    console.log(req.params.id);
    adminHelpers.cancelOrder(req.params.id).then((response) => {
      res.send(response);
    });
  },

  getDashboard: async (req, res) => {
    let orders = await adminHelpers.getAllOrders();

    let cancelCount = await adminHelpers.cancelledOrderCount();
    let pendingCount = await adminHelpers.pendingOrderCount();
    let placedCount = await adminHelpers.placedOrderCount();

    let result = [];
    result.push(cancelCount, placedCount, pendingCount);

    let stats = await userHelper.orderCount();
    
    let data = [0,0,0,0,0,0,0,0,0,0,0,0];
    for(let i = 0; i < stats.length; i++) {
      data[stats[i]._id] = stats[i].totalAmount;
    }
    res.render("admin/dashboard", { result, order: orders.length, data });
  },

  viewBanners: async(req, res) => {
    let banners = await adminHelpers.getBanners()
    res.render("admin/view-banners", {banners})
  },

  addBanner: async (req, res) => {
    
    try {
      const imgUrl = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        imgUrl.push(result.url);
      }
      adminHelpers.addBanner(req.body, async (id) => {
        console.log(id);
        productHelpers.addBannerImages(id, imgUrl).then((response) => {
          // console.log(response);
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      req.session.submitStatus = "Banner Added";
      res.redirect("/admin/banners");
    }
  },
  deleteBanner: (req, res)=>{
    adminHelpers.deleteBanner(req.params.id).then((response)=>{
      res.json({deleted: true})
    })
  }

};
