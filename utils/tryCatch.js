exports.tryCatch = (controller) => async(req, res, next)=>{
    try {
        controller(req, res);
    } catch (error) {
        res.send({
            error:{
              status: error.status || 500,
              message: error.message
            }
        })
    }
}