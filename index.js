/*jslint node:true */
var jsonfile = require('jsonfile');
// define the express variable so we can create routes for the server later
var express = require('express');
// create the app variable to apply an express intance to the server
var app = express();


//lets me use static files
app.use(express.static('public'));
// setup the server
var http = require('http').Server(app);

// create a socket.io instance on the server
var io = require('socket.io')(http);

// listen on port 6000 and respond when the server begins listening
http.listen(6010, function () {
	console.log('app listening on port 6010.');
});


var file = 'gundata.json';


// for specific id use something like this
// var stream = T.stream('statuses/filter', { follow: '1083314617' });
io.on('connection', function(socket){
  console.log('a user connected');
	/*
	io.emit('returndata', {
			data: file
		});
		*/
	jsonfile.readFile(file, function(err, filedone) {
		io.emit('returndata', {
			data: filedone
		});
		console.log(filedone[0]);
	});
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// create a route for the request and response.  This will serve the index.html in the public directory when someone directs their browser to the server URL
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// create a route for serving javascript from the js folder within the public folder.  This will allow the html to link to its required javascript locally.
app.use("/js", express.static(__dirname + '/public/js'));
