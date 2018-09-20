var mongoose = require( 'mongoose' );

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
    required: true
	},
	email: {
		type: String,
	 index: {unique: true},
		required: true

	}})

  mongoose.model("Account",UserSchema,"users")
