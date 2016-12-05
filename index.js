/*jslint node:true */
/*===============Required Module References===============*/
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
/*====================================================================*/





/*===============Express Server Setup===============*/
var app = express(); 
var http = require('http').Server(app); /*Sets Up the Server*/
var io = require('socket.io')(http); /*Socket IO Instance*/
http.listen(6010, function () { /*Start Listening on perscribed port and log it*/
	console.log('app listening on port 6010.');
});
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('/public/'));/*Lets me use static files*/
/*====================================================================*/





/*===============Gun Incident Web Scraping===============*/
var gunData = []; /*Stores actual incident data as an array of objects*/
var numofpages; /*Stores how mang pages of incidents gunviolencearchive has*/

getNumPages();
function getNumPages() {
	request('http://www.gunviolencearchive.org/last-72-hours', function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);
			var tempLastPageRef = $('li.pager-last.last').children('a').attr('href');
			numofpages = tempLastPageRef.substring((tempLastPageRef.indexOf('=')+1), tempLastPageRef.length);
		}
		getGunDatalogs();
	});
}
function getGunDatalogs() {
	console.log(numofpages);
	for (var k = 0; k <= numofpages; k++) {
		//console.log(k);
		var tempIncidentDate;
		var tempState;
		var tempCityOrCounty;
		var tempAddress;
		var tempKilled;
		var tempInjured;
		var tempSource;
		var tempIncidentObj;

		if (k === 0) {
			request('http://www.gunviolencearchive.org/last-72-hours', function (error, response, html) {
				var $ = cheerio.load(html);
				//console.log(html);
				$('tr', 'tbody').each(function(i, element){
					$('td', this).each(function(i, element){
						switch(i) {
							case 0:
								tempIncidentDate = $(this).text();
								break;
							case 1:
								tempState = $(this).text();
								break;
							case 2:
								tempCityOrCounty = $(this).text();
								break;
							case 3:
								tempAddress = $(this).text();
								break;
							case 4:
								tempKilled = $(this).text();
								break;
							case 5:
								tempInjured = $(this).text();
								break;
							case 6:
								tempSource = $('li.1.last', this).children('a').attr('href');
								break;
							default:
								console.log("default");
						}
					});
					tempIncidentObj = {
							"IncidentDate": tempIncidentDate,
							"State": tempState,
							"CityOrCounty": tempCityOrCounty,
							"Address": tempAddress,
							"Killed": tempKilled,
							"Injured": tempInjured,
							"Source": tempSource,
					};
					//console.log("==tr==");
					//console.log(tempIncidentObj);
					gunData.push(tempIncidentObj);
				});
			});
		}
		else {
			console.log('http://www.gunviolencearchive.org/last-72-hours?page=' + k);
			request(('http://www.gunviolencearchive.org/last-72-hours?page=' + k), function (error, response, html) {
				var $ = cheerio.load(html);
				$('tr', 'tbody').each(function(i, element){
					$('td', this).each(function(i, element){
						switch(i) {
							case 0:
								tempIncidentDate = $(this).text();
								break;
							case 1:
								tempState = $(this).text();
								break;
							case 2:
								tempCityOrCounty = $(this).text();
								break;
							case 3:
								tempAddress = $(this).text();
								break;
							case 4:
								tempKilled = $(this).text();
								break;
							case 5:
								tempInjured = $(this).text();
								break;
							case 6:
								tempSource = $('li.1.last', this).children('a').attr('href');
								break;
							default:
								console.log("default");
						}
					});
					tempIncidentObj = {
						"IncidentDate": tempIncidentDate,
						"State": tempState,
						"CityOrCounty": tempCityOrCounty,
						"Address": tempAddress,
						"Killed": tempKilled,
						"Injured": tempInjured,
						"Source": tempSource,
					};
					//console.log("==tr==");
					//console.log(tempIncidentObj);
					gunData.push(tempIncidentObj);
				});
			});
		}
	}
	console.log("Done");
}
/*====================================================================*/





/*===============Reverse Geocoder Setup===============*/
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',

  httpAdapter: 'https',
  apiKey: 'AIzaSyBKvrM39cdS8zhEf8JP9e2uouMkkiIIRSU', 
  formatter: null
};
var geocoder = NodeGeocoder(options);
var userLocation;
/*====================================================================*/





/*===============CLIENT CONNECTION===============*/
/*On connection we know the client needs gun data, so immidately pass that along*/
io.on('connection', function(socket){ 
  console.log('a user connected');
	
	/*Pass Gun Data to Client*/
	io.emit('sendgundata', { 
		data: gunData
	});
	
	/*Called by client when the navigator finishes gathering location*/
	socket.on('passLoc', function(data) { 
		geocoder.reverse({lat:data.latitude, lon:data.longitude}, function(err, res) {
			userLocation = res;
			io.emit('passbackLoc', { /*Passes results object back to client*/
				results: res
			});
		});
	});
	
	/*Called by the client upon disconnection*/
	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
	/**/
});
/*====================================================================*/