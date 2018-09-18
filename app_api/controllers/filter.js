var mongoose = require('mongoose');
var question = mongoose.model('combine_problems');

module.exports.QuestionList = function (req,res){
  var page_num = parseInt(req.params.page_num);
  let skip  = page_num*5;
  let book_id = req.params.book_id;
  let chapter = ">"
  let type = req.params.type;

  if(req.params.chapter_name !== "All Chapters"){
    chapter += req.params.chapter_name;
    chapter = chapter.trim();
  }
  var query = [{ "book_id": book_id}, {"crumb" :  new RegExp(chapter)}];

  if(type !== "All Question Types")
  {
    query.push({"type" : new RegExp(type)});
  }
  question
  .find({$and: query})
  .sort( { random_rank: 1 } )
  .limit(50)
  .skip(skip)
  .exec(function(err,quest){
    if (err) {
      res.send({status:'failure', message:err, data:[]});
    }
    else{
      res.send({status:'success', message:'Questions Found', data:quest})
    }
  })
}

module.exports.versioning = function(req,res){
  var page_num = parseInt(req.params.page_num);
  let skip  = page_num*5;
  let book_id = req.params.book_id;
  let chapter = ">"
  let type = req.params.type;

  if(req.params.chapter_name !== "All Chapters"){
    chapter += req.params.chapter_name;
    chapter = chapter.trim();
  }
  var query = [{ "book_id": book_id}, {"crumb" :  new RegExp(chapter)}];

  if(type !== "All Question Types")
  {
    query.push({"type" : new RegExp(type)});
  }
  question
  .aggregate(
    [
      { $match : {$and: query} },
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
        { $skip : skip },
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
