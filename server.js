//Setup web server and socket
'use strict';

var twitter = require('twitter');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/twit';
var mongoose = require('mongoose');
mongoose.connect(url);
var Schema = mongoose.Schema;
var socketList = [];

//var key = /love/;

io.on('connection', function (socket) {
  socketList.push(socket);
  socket.on('sendchoice', function (data){
  // console.log(data);
	// var key = data;
  //"iphone","love", "music", "happy", "funny", "lol", "travel"
  var key;
  if (data == 'iphone') {
    key = /iphone/;
  }
  if (data == 'love') {
    key = /love/;
  }
  if (data == 'music') {
    key = /music/;
  }
  if (data == 'happy') {
    key = /happy/;
  }
  if (data == 'funny') {
    key = /funny/;
  }
  if (data == 'lol') {
    key = /lol/;
  }
  if (data == 'travel') {
    key = /travel/;
  }

  console.log (key);

  var findKeywords = function(db, callback) {
  //This functions like a 'LIKE= %keyword%' operation 
   var cursor =db.collection('twit_col').find({tweet:key}); //change here for proper query with keyword
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        //json object
        var outputPoint = {
            "lat": doc.latitude,
            "lng": doc.longitude,
            "tweet":doc.tweet
        };

        socket.broadcast.emit("twitter-stream", outputPoint);
        //Send out to web sockets channel.
        socket.emit('twitter-stream', outputPoint);

        console.log(doc);
      } else {
         callback();
      }
   });
};


//Call varKewords function
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  findKeywords(db, function(data) { 
    
    db.close();
  });
});

}); //io.on
});//socket.on


//Setup rotuing for app
app.use(express.static(__dirname + '/public'));

var PORT = 5000;
http.listen(PORT, function() {
    console.log("listening on " + PORT);
});