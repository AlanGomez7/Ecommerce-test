const createHttpError = require("http-errors");
const userHelper = require('../helpers/userHelper')

module.exports = {

    
     verifyLoggin : async(req, res, next)=>{
       if(req.session.userLoggedIn){
          let user = await userHelper.getUser(req.session.user)
          if(user.isAllowed){
            next()
          }else{
            req.session.user = false;
            res.redirect('/login');
          }
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