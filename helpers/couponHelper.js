var db = require("../config/connection");
var collection = require("../config/collection");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  unlistCoupon: (id) => {
    return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .updateOne(
            { _id: ObjectId(id) },
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
    listCoupon: (id) => {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.COUPON_COLLECTION)
          .updateOne(
            { _id: ObjectId(id) },
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
}


