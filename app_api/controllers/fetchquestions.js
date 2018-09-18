var mongoose = require('mongoose');
var question = mongoose.model('combine_problems');


var sendJsonResponse = function(res, status, content) {
 res.status(status);
 res.json({status:'',message:'',data:[]});
};
module.exports.questionsList = function (req, res) {
var page_num = parseInt(req.params.page_num);
let skip  = page_num*5;
var book_id = req.params.book_id;

    question
    .find({"book_id": book_id})
    .limit(5)
    .skip(skip)
    .exec(function(err, question) {
      if (err) {
           res.send({status:'failure', message:err, data:[]});
    	    } else {
            console.log(question.length);
    	     res.send({status:'success', message:'Questions Found', data:question})
    	    }
    })
};

module.exports.bookName = function(req, res){
  var book_id = req.params.book_id;
question
.findOne({"book_id":book_id})
.select("crumb")
.exec(function(err,bookname){
  if (err) {
       res.send({status:'failure', message:err, data:[]});
      } else {
        if(bookname !== null){
        let myJSON = JSON.stringify(bookname);
        let myobj = JSON.parse(myJSON);
        let name = myobj.crumb.split(">");
        res.send({status:'success', message:'Book Found', data:name[0]})
      }
      else{
          res.send({status:'success', message:'Book Not Found', data:"No such book in the directory"})
      }

      }
})
}

module.exports.questionTypes = function(req, res){
  var  book_id = req.params.book_id;
  question
  .find({"book_id":book_id})
  .distinct("type")
  .exec(function(err,type){
    if (err) {
         res.send({status:'failure', message:err, data:[]});
        }
        else{
            res.send({status:'success', message:'Question Types Found', data:type})
        }
})}


module.exports.chapters = function(req, res){
  var  book_id = req.params.book_id;
question
.aggregate(
    [ { $match : {"book_id":book_id} },
{$project : {chapter : { $arrayElemAt: [  { $split: ["$crumb", ">"] },1]}}},
{ $group : { _id : null,
chapter: { $addToSet: "$chapter" }  }},
  ]
  )
  .exec(function(err,type){
    if (err) {
         res.send({status:'failure', message:err, data:[]});
        }
        else{
            res.send({status:'success', message:'Chapters List Found', data:type})
        }
})

}


module.exports.searchQuestions = function(req ,res){
  var book_id = req.params.book_id;
  var regex = new RegExp(req.params.key,'i');
    question
    .find({$and : [{"book_id":book_id},{'question' : regex}]})
    .limit(5)
    .exec(function(err, question) {
      if (err) {
           res.send({status:'failure', message:err, data:[]});
          } else {
            console.log(question.length);
           res.send({status:'success', message:'Questions Found', data:question})
          }
    })}
