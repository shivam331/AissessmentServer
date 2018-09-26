var mongoose = require('mongoose');
var question = mongoose.model('combine_problems');
var blacklists =mongoose.model('blacklists')

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
 function blacklisted(){

   var a = blacklists.find().exec();
   return a;
}
module.exports.questionTypes = function(req, res){

  var  book_id = req.params.book_id;
  blacklisted().then(function(distractors){
    let myJSON = JSON.stringify(distractors[0]);
    let myobj = JSON.parse(myJSON);

    question
    .find({$and:[ {"book_id":book_id},{ type: { $nin: myobj.ProblemType} } ]})
    .distinct("type")
    .exec(function(err,type){
      if (err) {
           res.send({status:'failure', message:err, data:[]});
          }
          else{
              res.send({status:'success', message:'Question Types Found', data:type})
          }
  })
  })



}


module.exports.chapters = function(req, res){
  var  book_id = req.params.book_id;
  blacklisted().then(function(distractors){
    let myJSON = JSON.stringify(distractors[0]);
    let myobj = JSON.parse(myJSON).Chapter;
question
.aggregate(
    [ { $match : {"book_id":book_id} },
{$project : {chapter : { $arrayElemAt: [  { $split: ["$crumb", ">"] },1]}}},
{ $group : { _id : null,
chapter: { $addToSet: "$chapter" }  }},
{$project: {
        chapter: {
           $filter: {
              input: "$chapter",
              as: "item",
              cond:{ $not:[ { $in: [  "$$item", myobj ] }]}
           }
        }
     }}
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

})}


module.exports.searchQuestions = function(req ,res){
  var book_id = req.params.book_id;
  var regex = new RegExp(req.params.key,'i');
  console.log(book_id);

  question
  .aggregate(
    [
      { $match : {$and: [{"book_id":book_id},{'question' : regex}]} },
      {
        $group:{
          _id : '$sen.line',
          questions_list: { $push:  {
            _id : "$_id",
            question: "$question",
            random_rank:"$random_rank",
            choices:"$choices",
            answer:"$answer" } }
          }
        },
        { $sort : { random_rank: 1 } },

        { $limit : 50 },

      ]
    )
    .exec(function(err,quest){
      if (err) {
        res.send({status:'failure', message:err, data:[]});
      }
      else{
        res.send({status:'success', message:'Questions Found', data:quest})
      }
    })


  }
