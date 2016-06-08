//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app);

//var bodyParser = require('body-parser'); //Added

//var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/twit';
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/twit');

//Setup twitter stream api
var twit = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
}),
stream = null;

/*app.listen(8080, function() {
  console.log('Server running at http://127.0.0.1:8080/');
});
//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup rotuing for app
app.use(express.static( __dirname + '/public'));*/

var KEYWORDS = ["iphone","love", "music", "happy", "funny", "lol", "travel"];

//Create web sockets connection.
//io.sockets.on('connection', function (socket) {
  //  socket.on("start tweets", function () {

        if (stream === null) {
            //Connect to twitter stream passing in filter for entire world.
            twit.stream('statuses/filter', {'track': 'iphone, love, music, happy, funny, lol, travel', 'language': 'en'}, function (stream) {
                stream.on('data', function (data) {
                    // Does the JSON result have coordinates
                    if (data.coordinates) {
                        if (data.coordinates !== null) {
                            //If so then build up some nice json and send out to web sockets
                            // var outputPoint = {
                            //     "lat": data.coordinates.coordinates[0],
                            //     "lng": data.coordinates.coordinates[1]
                            // };

                            //store in database
                            var users = db.get('twit_col');
                            console.log(data.text);

                            // get the keyword matches
                            var classifications = data.text.split(' ').filter(function(key) {
                                return KEYWORDS.indexOf(key) > -1;
                            });

                            users.insert({
                                name: data.user.screen_name,
                                user_id: data.user.id,
                                latitude: data.coordinates.coordinates[0],
                                longitude: data.coordinates.coordinates[1],
                                tweet: data.text,
                                categories: classifications //this is an array of keywords
                            });

                            //Debugging code to print out db data
                            users.find({}, {}, function (e, testvar) {
                                 //  console.log(testvar);     
                            });

                            //socket.broadcast.emit("twitter-stream", outputPoint);

                            //Send out to web sockets channel.
                            //socket.emit('twitter-stream', outputPoint);
                        } else if (data.place) {
                            if (data.place.bounding_box === 'Polygon') {
                                // Calculate the center of the bounding box for the tweet
                                var coord, _i, _len;
                                var centerLat = 0;
                                var centerLng = 0;

                                for (_i = 0, _len = coords.length; _i < _len; _i++) {
                                    coord = coords[_i];
                                    centerLat += coord[0];
                                    centerLng += coord[1];
                                }
                                centerLat = centerLat / coords.length;
                                centerLng = centerLng / coords.length;

                                //store in database
                            var users = db.get('twit_col');
                            console.log("From if " + data.text);

                            // get the keyword matches
                            var classifications = data.text.split(' ').filter(function(key) {
                                return KEYWORDS.indexOf(key) > -1;
                            });

                            users.insert({
                                name: data.user.screen_name,
                                user_id: data.user.id,
                                latitude: centerLat,
                                longitude: centerLng,
                                tweet: data.text,
                                categories: classifications //this is an array of keywords
                            });

                            //Debugging code to print out db data
                            users.find({}, {}, function (e, testvar) {
                                   console.log(" From else " + testvar);     
                            });                                
                                // var outputPoint = {
                                //     "lat": centerLat,
                                //     "lng": centerLng
                                // };
                                //socket.broadcast.emit("twitter-stream", outputPoint);

                            }
                        }
                    }
                    stream.on('limit', function (limitMessage) {
                        return console.log(limitMessage);
                    });

                    stream.on('warning', function (warning) {
                        return console.log(warning);
                    });

                    stream.on('disconnect', function (disconnectMessage) {
                        return console.log(disconnectMessage);
                    });
                });
            });
        }
