const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email });
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  getReport: (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          {
            $match: {
              status: "Delivered",
              date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            },
          },
          {
            $sort: {
              date: -1,
            },
          }
        ]).toArray()
        resolve(orders);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      adminData.password = await bcrypt.hash(adminData.password, 10);
      db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData);
      resolve(adminData);
    });
  },

  verfiyCoupon: (code)=>{
    code = ""+code
    return new Promise ((resolve, reject) => {
        let coupons = db.get().collection(collection.COUPON_COLLECTION).findOne({code: code})
        resolve(coupons)  
    })
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      let users = db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              isAllowed: false,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  unBlockUser: (userId) => {
    return new Promise((resolve, reject) => {
      // productDetails.price=parseInt(productDetails.price)
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              isAllowed: true,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  addCategory: (category, callback) => {
    category.isListed = true;
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .insertOne(category)
      .then((data) => {
        callback(data.insertedId);
      });
  },

  editCategory: (category, callback) => {
    db.get()
      .collection(collection.CATEGORY_COLLECTION)
      .updateOne({ _id: ObjectId(category.id) },
        {
          $set: {
            categoryname: category.categoryname
          }
        }
      )
  },

  getCategories: () => {
    return new Promise((resolve, reject) => {
      let categories = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(categories);
    });
  },

  getCategory: (categoryName) => {
    console.log(categoryName);
    return new Promise((resolve, reject) => {
      let category = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ categoryname: categoryName });
      resolve(category);
    });
  },

  getOrders: (skip, pageSize) => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .skip(skip)
        .limit(pageSize)
        .toArray();
      resolve(orders);
    });
  },

  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },

  getOrderTotals: () => {
    return new Promise((resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },

  getDeliveredOrders: async() => {
    let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
    return orders
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(orderItems);
    });
  },

  getOrderDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .toArray();
      resolve(order);
    });
  },

  orderDetails: (Id) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: ObjectId(Id) })
        .toArray();
      resolve(order);
    });
  },

  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "cancelled",
            },
          }
        );
      resolve();
    });
  },

  returnOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "Returned",
            },
          }
        );
      resolve();
    });
  },

  deliveredOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "Delivered",
            },
          }
        );
      resolve();
    });
  },

  cancelledOrderCount: () => {
    return new Promise(async (resolve, reject) => {
      var count = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "cancelled" });
      resolve(count);
    });
  },

  placedOrderCount: () => {
    return new Promise(async (resolve, reject) => {
      var count = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "Placed" });
      resolve(count);
    });
  },

  pendingOrderCount: () => {
    return new Promise(async (resolve, reject) => {
      var count = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .countDocuments({ status: "pending" });
      resolve(count);
    });
  },
  findOrderCount: async () => {
    let countUsers = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .countDocuments();
    return countUsers;
  },

  findProductCount: async () => {
    let countUsers = await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .countDocuments();
    return countUsers;
  },

  getBanners: () => {
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banners);
    });
  },
  addBanner: (banner, callback) => {
    db.get()
      .collection(collection.BANNER_COLLECTION)
      .insertOne(banner)
      .then((data) => {
        callback(data.insertedId);
      });
  },

  deleteBanner: (bannerId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: ObjectId(bannerId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  addCoupons: (coupons) => {
    coupons.createdTime = new Date();
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .insertOne(coupons)
        .then((response) => {
          resolve(response);
        });
    });
  },
  getCoupons: () => {
    return new Promise((resolve, reject) => {
      let coupons = db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(coupons);
    });
  },

  listCategory: (catid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(catid) },
          {
            $set: {
              isListed: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  unlistCategory: (catid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(catid) },
          {
            $set: {
              isListed: false,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  userOrderedProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      resolve(orderItems);
    });
  },

  returnMoney: (userId, userDetails) => {
    userDetails = +userDetails;
    return new Promise((resolve, reject) => {
      // productDetails.price=parseInt(productDetails.price)
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $inc: {
              wallet: userDetails,
            },
          },
          { upsert: true }
        )
        .then(() => {
          resolve();
        });
    });
  },

  totalProducts: async () => {
    let count = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments();
    return count
  },

  totalOrderAmount: () => {
    return new Promise(async (resolve, reject) => {
      let amount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { status: "Delivered" } },
          {
            $group: {
              _id: "",
              TotalSum: { $sum: "$total" },
            },
          },
        ])
        .toArray();
      resolve(amount);
    });
  },
};
