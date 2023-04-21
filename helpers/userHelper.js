var db = require('../config/connection');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { date } = require('joi');




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
        console.log(typeof mobile)
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
                    password: userDetails.password,
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
        console.log(userId, password, "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
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
            resolve(total[0].total);
        });
    },
    placeOrder: (order, products, total)=>{
        return new Promise((resolve, reject)=>{
            // let status = order['payment-method'] === 'COD' ? 'placed': 'pending';
            let orderObj={
                deliveryDetails: {
                    address: order.address,
                    buildingName: order.buildingname,
                    postalCode: order['postal-code'],
                    state: order.state,
                    email: order.emailaddress,
                    mobile: order.phone
                },
                userId: ObjectId(order.userId),
                fname: order.fname,
                lname: order.lname,
                total: total,
                paymentMethod: "COD",
                products: products,
                status: "Pending",
                date: Date.now()
                
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((resolved) => {
                resolve()
            })
        })
    },

    getCartProductList: (order)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(order)})
            // console.log(cart)
            resolve(cart.products)
        })
    }
};

