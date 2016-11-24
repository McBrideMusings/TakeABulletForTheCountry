/*jslint node:true */
var jsonfile = require('jsonfile');
// define the express variable so we can create routes for the server later
var express = require('express');
// create the app variable to apply an express intance to the server
var app = express();
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyBKvrM39cdS8zhEf8JP9e2uouMkkiIIRSU', // for Mapquest, OpenCage, Google Premier 
  formatter: null         // 'gpx', 'string', ... 
};
var geocoder = NodeGeocoder(options);
var userLocation;

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
var operationsdata;
var scraper = require('table-scraper');

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
		//console.log(filedone[0]);
	});
	scraper
  .get('http://www.gunviolencearchive.org/last-72-hours')
  .then(function(tableData) {
    operationsdata = tableData[0][0].Operations;
		console.log(operationsdata);
		io.emit('returntabledata', {
			data: tableData
		});
  });
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
	socket.on('passLoc', function(data) {
		geocoder.reverse({lat:data.latitude, lon:data.longitude}, function(err, res) {
			userLocation = res;
			io.emit('passbackLoc', {
				results: res
			});
		});
	});
});

// create a route for the request and response.  This will serve the index.html in the public directory when someone directs their browser to the server URL
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

// create a route for serving javascript from the js folder within the public folder.  This will allow the html to link to its required javascript locally.
app.use("/js", express.static(__dirname + '/public/js'));
