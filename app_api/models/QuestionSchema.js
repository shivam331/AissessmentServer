var mongoose = require( 'mongoose' );

var question = new mongoose.Schema({});
var blacklists  = new mongoose.Schema({});

mongoose.model("combine_problems",question,"combine_problems")
mongoose.model("blacklists",blacklists,"blacklists")
