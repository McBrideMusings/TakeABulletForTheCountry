/*jslint node:true */
/*Required Module References*/
var jsonfile = require('jsonfile'); 
var express = require('express');
var app = express(); 
var http = require('http').Server(app); /*Sets Up the Server*/
var io = require('socket.io')(http); /*Socket IO Instance*/
http.listen(6010, function () { /*Start Listening on perscribed port and log it*/
	console.log('app listening on port 6010.');
});
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public')); /*Lets me use static files*/
/**/
/*Reference to Admin loaded JSON*/
var file = 'gundata.json';
/**/



/*Geocoder Setup*/
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
/**/





/*CLIENT CONNECTION*/
/*On connection we know the client needs gun data, so immidately parse that and pass it along*/
io.on('connection', function(socket){ 
  console.log('a user connected');
	
	
	/*Gun Data Parsing*/
	jsonfile.readFile(file, function(err, filedone) { 
		io.emit('returndata', { /*passes parsed data object to client*/
			data: filedone
		});
	});
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
	/**/
	
	
	
	/*Location Data Parsing*/
	socket.on('passLoc', function(data) { /*Called when the Navigator gets a location*/
		geocoder.reverse({lat:data.latitude, lon:data.longitude}, function(err, res) {
			userLocation = res;
			io.emit('passbackLoc', { /*Passes results object back to client*/
				results: res
			});
		});
	});
	/**/
});










