var mongoose = require('mongoose');
var question = mongoose.model('combine_problems');
var blacklists =mongoose.model('blacklists')

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

function blacklisted(){

  var a = blacklists.find().exec();
  return a;
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
    query.push({"type" : type});
  }

  blacklisted().then(function(distractors){
    let myJSON = JSON.stringify(distractors[0]);
    let myobj = JSON.parse(myJSON).Choices;

  question
  // .find({$and:[{ "book_id": book_id},{"type" : "Example"}]})
  .aggregate(
    [
      { $match : {$and: query} },
      {$sort :{type: 1}},
      {
        $group:{
          _id : '$sen.line',
          questions_list: { $push:  {
            _id : "$_id",
            question: "$question",
            random_rank:"$random_rank",
            type:"$type",
            choices:{
               $filter: {
                  input: "$choices",
                  as: "item",
                  cond:{ $not:[ { $in: [  "$$item", myobj ] }]}
               }
            },
            answer:"$answer" } }
          }
        },
        { $skip : skip },

        { $limit : 50 },

      ]
    )
    .exec(function(err,quest){
      if (err) {
        res.send({status:'failure', message:err, data:[]});
      }
      else{
        res.send({status:'success', message:'Questions Found', data:quest, blacklist :distractors[0]})
      }
    })
  })
  }



module.exports.bookList = function(req,res){
  question
  .aggregate(
  [ {$project : {bookName : { $arrayElemAt: [  { $split: ["$crumb", ">"] },0]},
book_id: "$book_id"}},
  { $group : { _id : "$book_id",
  bookname:{ $first: "$bookName" }   }}  ]
    )
    .exec(function(err,bookName){
      if (err) {
           res.send({status:'failure', message:err, data:[]});
          }
          else{
              res.send({status:'success', message:'Book List Found', data:bookName})
          }
  })

}

module.exports.distractors = function(req,res){
  blacklists
  .find()
  .exec(function(err,distractors){
    if (err) {
      res.send({status:'failure', message:err, data:[]});
    }
    else{
      res.send({status:'success', message:'Questions Found', data:distractors})
    }
  })

}

module.exports.blacklistDistractors = function(req,res){
  var distractors = req.body.distractor;
  console.log(distractors);

  blacklists
  .updateOne(
    {},
    { $pull: { Choices: { $in: ["force","change"] } }},
    { multi: true }
)
  // .updateOne({},{$addToSet: { Choices: distractors } } )
  .exec(function(err,bookName){
    if (err) {
         res.send({status:'failure', message:err, data:[]});
        }
        else{
            res.send({status:'success', message:'Added to blacklist', data:bookName})
        }
})
}


module.exports.updateDistractors = function(req,res)
{
let from = req.body.from
let to = req.body.to
console.log("blacklists",blacklists);
console.log(from + " " + to);
try{
  blacklists
  // .remove({"_id":"5ba9e2ad718baa29e8079764"})
.updateOne({"Editing.from":from},
    { "Editing.$":[{from:from,to:to}] })
.exec(function(err,modified){
  if (err) {
       res.send({status:'failure', message:err, data:[]});
      }
      else{
        let myJSON = JSON.stringify(modified);
        let myobj = JSON.parse(myJSON);
        if(myobj.n == 0){
          blacklists
          .updateOne({},
          {$push:{Editing : {from:from,to:to}}})
          .exec(function(err,pushed){
            if(err){
              res.send({status:'failure', message:err, data:[]});
            }
            else{
              res.send({status:'success', message:'Distractor Editted Successfully', data:pushed})
            }
          })
        }
        else{
          res.send({status:'success', message:'Distractor Editted Successfully', data:myobj.n})
        }
      }
})
;

}catch(e){
  console.log(e);
}

}
