var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { date, object } = require('joi');




module.exports = {
    doSignup:(userData)=>{
        userData.isAllowed = true;
        return new Promise(async(resolve, reject)=>{

            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData)

            resolve(userData)
        })
    }, 
     doLogin:(userData)=>{
        console.log(userData,">>>>>>>")
        return new  Promise(async(resolve, reject)=>{
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});
            console.log(user.isAllowed)
            if(user){
                bcrypt.compare(userData.password, user.password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else if(user){
                resolve({status:false})
                console.log('login failed')
            }
        })
    },
    
    getUser : (userData)=>{
        return new Promise(async(resolve, reject)=>{
            var user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email})
            resolve (user)
        });
    },

    getCartCount: (userId)=>{
        return new Promise(async(resolve, reject) =>{
            let count = 0;
            
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(userId)})
            if(cart){
                count = cart.products.length;
            }
            resolve(count)
        })
    },

    getUserByMobile: (mobile)=>{
         
        return new Promise(async(resolve, reject)=>{
            var user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile: mobile})
            resolve (user)
        });
    },

    updateUser:(userId,userDetails)=>{
        return new Promise((resolve,reject)=>{
            // productDetails.price=parseInt(productDetails.price)
            db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:ObjectId(userId)},{
                $set:{
                    username:userDetails.username,
                    email:userDetails.email,
                    firstname: userDetails.firstname,
                    lastname: userDetails.lastname,
                    mobile:userDetails.mobile,
                },
            },
            {upsert: true})
            .then(()=>{
                resolve()
            })
        })
    },

    updatePassword:(userId,password)=>{
        return new Promise(async(resolve,reject)=>{
           let passwordBcrypt = await bcrypt.hash(password, 10)
            console.log(passwordBcrypt)
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
            {
                $set:{
                    password:passwordBcrypt
                }
            }).then((result)=>{
                resolve(result)
            });
        })
    },

     changeProductQuantity: (details)=>{
        details.count = +details.count;
        details.quantity = 1;
        return new Promise(async(resolve,reject)=>{
           
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id: ObjectId(details.cartId), 'products.item': ObjectId(details.proId)},
            {
                $inc: {'products.$.quantity': details.count}
            }
            ).then((response)=>{
                resolve({status: true})
            })
            
        })
    }, 
    deleteCartProduct: (details) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id: ObjectId(details.cartId)},{
                $pull: {products: {item:ObjectId(details.proId)}}
            }).then((response)=>{
                resolve(response)
            });
        })
    },
    getTotalAmount : (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db
              .get()
              .collection(collection.CART_COLLECTION)
              .aggregate([
                {
                  $match: { user: ObjectId(userId) },
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
                },{
                    $group:{
                        _id: null,
                        total: {$sum: {$multiply: ['$quantity', '$product.price']}}
                    }
                }
               
              ])
              .toArray();
            resolve(total);
        });
    },
    placeOrder: (order, products, total, user)=>{
        console.log(order.userId)
        return new Promise((resolve, reject)=>{
            let status = user.paymentmethod === 'COD' ? 'placed': 'pending';
            let orderObj={
                deliveryDetails: {
                    username: order.username,
                    address: order.address,
                    postalCode: order.pincode,
                    state: order.state,
                    district: order.district,
                    mobile: order.mobile,
                    altMobile: order.alternatemobile
                },
                userId: ObjectId(user.userId),
                products: products,
                paymentMethod: user.paymentmethod ,
                status: status,
                total: total,
                date: Date.now()
                
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((resolved) => {
                resolve()
            })
        })
    },

    decreaseStock: (id)=>{
        return new Promise(async(resolve, reject) => {
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: ObjectId(id)}, {
                $inc: {stock: -1}
            })
            resolve(result)
        })

    },

    getCartProductList: (order)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(order)})
            // console.log(cart)
            resolve(cart.products)
        })
    },

    addAddress : (address, user)=>{
        console.log(address, user)
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id: ObjectId(user)},{
                $push:{
                    address 
                },
            }, {
                upsert: true
            }).then((response)=>{
                resolve(response);
            })
        })
    },

    getAddress: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let address = await db.get().collection(collection.USER_COLLECTION).findOne({_id: ObjectId(userId)})
            resolve(address.address)
        })
    },
    updateCartProductList: (order)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).updateOne({user: ObjectId(order)},{
                $set:{
                    brought: true
                }
            })
            // console.log(cart)
            resolve(cart)
        })
    },    
    deleteCart: (userId) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user: ObjectId(userId)}).then((response)=>{
                resolve(response)
            });
        })
    },
};

