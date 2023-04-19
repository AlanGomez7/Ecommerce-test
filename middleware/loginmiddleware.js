const createHttpError = require("http-errors");

module.exports = {

    
     verifyLoggin : (req, res, next)=>{
        if(req.session.userLoggedIn === true){ 
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
          res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
          res.setHeader("Expires", "0");
          next()
        }else{
          res.redirect('/login');
        }
      
    },

    verifyAdmin : (req, res, next)=>{
        try{
          if(req.session.adminLoggedIn === true) next()
          else throw createHttpError.Forbidden("Not Allowed")
        }catch(err){
          res.render('403')
        }
    }, 


}