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
app.use(express.static('public'));/*Lets me use static files*/
/*====================================================================*/





/*===============Gun Incident Web Scraping===============*/
/*I'm going to do my best to break down this code but I'd highly recommned looking at the code for http://www.gunviolencearchive.org/last-72-hours while reading it, as it's very specific to their formatting*/
var gunData = []; /*Stores actual incident data as an array of objects*/
var numofpages; /*Stores how mang pages of incidents gunviolencearchive has*/

getNumPages();
/*this code reads the URL for the "Last" button at the bottom of the page and uses that to decide how many times the for loop in getGunDatalogs should run.*/
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
/*The Core of the code. Simply put, this chunk of code uses Cheerio to snag the text as it's formated on the gunviolencearchive last-72-hours pages. There's usually about 10 pages, and I wrote code that reads the button at the bottom that skips to the last page in order to know how many pages they have. I then wrote code that reads every row of each page and stores all of that as an array of objects.

This is obviously extremely dependent on how they formatted their site, so if that ever changes this will almost certainly break.*/
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

		/*the First page's URL is a little different, so that's a serperate conditional*/
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
								tempKilled = Number(tempKilled);
								break;
							case 5:
								tempInjured = $(this).text();
								tempInjured = Number(tempInjured);
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
		/*this is the meat of the code. The URL below is how they formatted these pages. Frankly pretty easy to iterate through each page*/
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