var mongoose = require( 'mongoose' );
var dbURI = 'mongodb://heroku_9xn39r0q:lcsq0nk22hm3f4gihoc5ss0ct4@ds153700.mlab.com:53700/heroku_9xn39r0q';
mongoose.connect(dbURI, {auto_reconnect:true, useNewUrlParser: true });


mongoose.connection.on('connected', function () {

  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
  mongoose.connect(dbURI, {auto_reconnect:true, useNewUrlParser: true });

});

var gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function () {
  gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function () {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
  });
});

// this here to require schema
require('./QuestionSchema');
