var db = require("../config/connection");
var collection = require("../config/collection");
const ObjectId = require("mongodb").ObjectId;
const { image } = require("../utils/cloundinary");
const { response } = require("express");
const { Collection } = require("mongodb");

module.exports = {
  addProducts: (product, callback) => {
    product.isListed = true;
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId);
      });
  },

  getProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ isListed: true })
        .toArray();
      resolve(products);
    });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  addProductImages: (proId, imgUrl) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: new ObjectId(proId) },
          {
            $set: {
              image: imgUrl,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  addCategoryImages: (catId, imgUrl) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: new ObjectId(catId) },
          {
            $set: {
              image: imgUrl,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  addBannerImages: (bannerId, imgUrl) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .updateOne(
          { _id: new ObjectId(bannerId) },
          {
            $set: {
              image: imgUrl,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  deleteProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(proid) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  listProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proid) },
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
  unListProduct: (proid) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proid) },
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
  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  getSingleProduct: (uniqueId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ uniqueId: uniqueId })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProducts: (proId, productDetails) => {
    return new Promise((resolve, reject) => {
      productDetails.price = parseInt(productDetails.price);
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              title: productDetails.title,
              category: productDetails.category,
              brand: productDetails.brand,
              description: productDetails.description,
              price: productDetails.price,
              stock: productDetails.stock
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      if (userCart) {
        let proExsit = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (proExsit != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          brought: false,
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getWishlistProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let listItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
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
      resolve(listItems);
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
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
      resolve(cartItems);
    });
  },
  getCategory: (catId) => {
    return new Promise((resolve, reject) => {
      let categoryDetails = db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: catId })
        .toArray();
      resolve(categoryDetails);
    });
  },
  searchProducts: (search) => {
    return new Promise(async (resolve, reject) => {
      let result = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand : { $regex: search, $options: "i" } }
        ] })
        .toArray();
      resolve(result);
    });
  },

  addToWishlist: (proId, userId) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      if (userCart) {
        let proExsit = userCart.products.findIndex(
          (product) => product.item == proId
        );
        if (proExsit != -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let wishlistObj = {
          user: ObjectId(userId),
          brought: false,
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlistObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
};
