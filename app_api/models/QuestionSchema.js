var mongoose = require( 'mongoose' );

var question = new mongoose.Schema({});
var choices_edited = new mongoose.Schema({
  from : {type:String,
		default:"AAA"},
  to : {type:String,
		default:"BBBBB"}
});
var blacklists  = new mongoose.Schema({
Chapter:[String],
Choices:[String],
Sentence:[String],
Concepts:[String],
ProblemType:[String],
Editing:[choices_edited]

});


var books = new mongoose.Schema({})

mongoose.model("combine_problems",question,"combine_problems")
mongoose.model("blacklists",blacklists,"blacklists")
mongoose.model("books",books,"books")
