var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
    doLogin:(adminData)=>{
        return new  Promise(async(resolve, reject)=>{
            let loginStatus = false;
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email});
            if(admin){
                bcrypt.compare(adminData.password, admin.password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.admin = admin;
                        response.status = true;
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
                console.log('login failed')
            }
        })
    },

    doSignup:(adminData)=>{
        return new Promise(async(resolve, reject)=>{
            adminData.password = await bcrypt.hash(adminData.password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData)
            resolve(adminData)
        })
    },

    getAllUsers: ()=>{
        return new Promise((resolve, reject)=>{
            let users = db.get().collection(collection.USER_COLLECTION).find().toArray();
                resolve(users);
        })
    },

    blockUser: (userId)=>{
        return new Promise((resolve,reject)=>{
            // productDetails.price=parseInt(productDetails.price)
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:ObjectId(userId)},{
                $set:{
                    isAllowed: false
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    unBlockUser: (userId)=>{
        return new Promise((resolve,reject)=>{
            // productDetails.price=parseInt(productDetails.price)
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:ObjectId(userId)},{
                $set:{
                    isAllowed: true
                }
            }).then(()=>{
                resolve()
            })
        })
    },

    addCategory: (category, callback) => {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(category)
          .then((data) => {
            console.log(data);
            callback(data.insertedId);
          });
    },
    
    getCategories: ()=>{
        return new Promise((resolve, reject)=>{
           let categories = db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories);
            
        })
    },

    getOrders: (skip, pageSize)=>{
        return new Promise ((resolve, reject) => {
            let orders = db.get().collection(collection.ORDER_COLLECTION).find().skip(skip).limit(pageSize).toArray()
            resolve(orders)  
        })
    },

    getAllOrders: ()=>{
        return new Promise ((resolve, reject) => {
            let orders = db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)  
        })
    },

    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
          let orderItems = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: {_id: ObjectId(orderId) },
              },
              {
                $unwind: '$products',
              },
              {
                $project: {
                  item: '$products.item',
                  quantity: '$products.quantity',
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product',
                },
              },
              {
                $project:{
                  item:1, quantity:1, product: {$arrayElemAt: ['$product', 0]}
                }
              }
            ])
            .toArray();
           
          resolve(orderItems);
        });
    },

    getOrderDetails: (userId)=>{
        return new Promise (async(resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({userId: ObjectId(userId)}).toArray()
            resolve(order)  
        })
    },

    orderDetails: (Id)=>{
        return new Promise (async(resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find({_id: ObjectId(Id)}).toArray()
            resolve(order)  
        })
    },
    
    cancelOrder: (orderId)=>{
        return new Promise (async(resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: ObjectId(orderId)}, {
                $set: {
                    status: 'cancelled'
                }
            })
            resolve()  
        })
    },

    cancelledOrderCount: ()=>{
        return new Promise (async(resolve, reject) => {
            var count = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: 'cancelled'})
            resolve(count)
        })
    },

    placedOrderCount: ()=>{
        return new Promise (async(resolve, reject) => {
            var count = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: 'Placed'})
            resolve(count)
        })
    },

    pendingOrderCount: ()=>{
        return new Promise (async(resolve, reject) => {
            var count = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({status: 'pending'})
            resolve(count)
        })
    },
    findOrderCount: async () => {
        let countUsers = await db.get().collection(collection.ORDER_COLLECTION).countDocuments()
        return countUsers
    },
    getBanners: ()=>{
        return new Promise(async(resolve, reject) => {
            let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banners)
        })
    },
    addBanner: (banner, callback) => {
        db.get()
          .collection(collection.BANNER_COLLECTION)
          .insertOne(banner)
          .then((data) => {
            console.log(data);
            callback(data.insertedId);
        });
    },
    
    deleteBanner: (bannerId) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id: ObjectId(bannerId)}).then((response)=>{
                resolve(response)
            });
        })
    },
    
}