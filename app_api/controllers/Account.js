var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Account = mongoose.model('Account');
const saltRounds = 10;

module.exports.registeruser = function(req,res){
  let name  = req.body.name
  let email = req.body.email
  let password = req.body.password

  bcrypt.hash(password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    if(!err)
        {
         var newUser = new Account({
     			name: name,
     			email:email,
     			password: hash
     		});

     	Account.create(newUser, function(newerr, user){
     			if (newerr) {
     	    res.send({status:'failure', message:newerr, data:[]});
     	    } else {
     	      res.send({status:'success', message:'User Registered Successfullly', data:user})
     	    }
     		});
        }
        else{
         res.send({status:'failure', message:err, data:[]});
        }
  });
}

module.exports.login = function(req,res){
  let email = req.body.email
  let password = req.body.password
  console.log(email   + password  );
  Account.findOne({email:email},function(err,user){
    if (err) {
        res.send({status:'failure', message:err, data:[]});
   } else  if(!user){
       res.send({status:'success', message:'No Such User Exist', data:[]})
   }
   else{
     bcrypt.compare(password, user.password, function(newerr, result) {
         if(!newerr)
        {
          if(result)
             {
              res.send({status:'success', message:'User Logged In Successfully', data:user})
             }
             else{
                res.send({status:'success', message:'Invalid email or password', data:[]})
             }
           }
           else{
               res.send({status:'failure', message:newerr, data:[]});
           }
     });
  }
  });



}
