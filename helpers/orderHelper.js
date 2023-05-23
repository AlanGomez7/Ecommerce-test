module.exports ={
    bindOrderDetails: (order, products)=>{
        for(let i = 0; i < products.length; i++){
            for(let j = 0; j < order.length; j++){
                if(products[i]._id.toString() == order[j]._id.toString()){
                    products[i].status = order[j].status
                }
            }
        }

        return products
    }
}