/*jslint browser:true */

/* Get my HTML References */
var output = document.querySelector("#out");
var bulletEntity = document.querySelector("#BulletsHere");
var incidentsUI = document.querySelector("#incidents");
var injuriesUI = document.querySelector("#injuries");
var deathsUI = document.querySelector("#deaths");
var locationUI = document.querySelector("#location");
var info = document.querySelector("#info");
var gun = document.querySelector("#gun");
var numk = document.querySelector("#numk");
var numi = document.querySelector("#numi");

/*Initialize my Variables to something I can check against easily */
var countLocalIncidents = 0;
var countLocalInjuries = 0;
var countLocalDeaths = 0;
var incidentsData;
var matchedIncidents = [];
var ready = false;
var bulletIncidents = [];
var city = "Atlanta";
var state = "Georgia";
var county = "Fulton";
var intervalID = window.setInterval(Update, 1000);
var timeElapsed = 0;
var gps = { //Edit this in the code and uncoomment line 82, 83 and 120
    "lat": 41.881832, //change default values otherwise computer will think you're at 0,0
    "lng": -87.623177
};
var sumInIncident = 0;

var states = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"];


function Start(data) {
	// TODO: Find a way to do reverse Geocoding
	incidentsData = data;
	ParseIncidents();
}

function Update() {
	// TODO: add loading screen stuff
	if (!ready) {return;}
	else {
		if (timeElapsed === 0) {
			locationUI.innerHTML = city + ", " + state;
			incidentsUI.innerHTML = countLocalIncidents + " of Gun Related Incidents";
			injuriesUI.innerHTML = countLocalInjuries + " of Gun Related Injures";
			deathsUI.innerHTML = countLocalDeaths + " of Gun Related Deaths";
		}
		for (var k = 0; k < bulletIncidents.length; k++) {
			//playGunSoundFXAni(incidentsToGenerate[0].injured, incidentsToGenerate[0].deaths);
			generateBullet(bulletIncidents[0]);
			bulletIncidents.shift();
		}
	}
	timeElapsed++;
}

function getRandomNumber(min, max) { //Used when creating new bullets to randomize their positon. Copied from Albith code.
    return Math.random() * (max - min) + min;
}

function generateBullet(incidentParsed) { //myCallback calls this function for each incident logged in incidentsToGenerate
    //console.log(incidentParsed);
    var randomX = getRandomNumber(0, 5);
    var randomZ = getRandomNumber(1, 2);
    var randomPos = randomX + " 0 " + randomZ;

    var entity = document.createElement("a-collada-model");
    
    entity.setAttribute("position", randomPos);
    entity.setAttribute("rotation", "0 0 0");
    entity.setAttribute("collada-model", "#bullet-dae");
    entity.setAttribute("class", "bullet");
		entity.setAttribute("data-incident", incidentParsed);
		entity.setAttribute("cursor-listener");

    info.innerHTML += incidentParsed.address;
    document.querySelector("#PutBulletsHere").appendChild(entity);
    /* This line is the one that causes duplicates of every incident to be generated, but still colors the bullets. It's confusing. I wanted to use color to distiguish between bullets that represent fatal and non fatal shootings. Oh well */
    //document.querySelector("#Bullet"+bulletCounter).setAttribute("material", materialSelected); //I don't understand why this doesn't work
    
    //bulletCounter++;
}

function playGunSoundFXAni(injured, deaths) { //this just uses the emit function in a-frame to make the gun and the cone animate for each incident logged in incidentsToGenerate. Also called in myCallback
    if (deaths > 0) {
        //cone.emit('fadeRed');
        //setTimeout(function(){ cone.emit('fadeWhite'); }, 400);
    }
    else if (injured > 0) {
        //cone.emit('fadeOrange');
        //setTimeout(function(){ cone.emit('fadeWhite'); }, 400);
    }
    else {
        //console("No Injures or Deaths")
    }
    gun.emit('shotsound');
    gun.emit('shot');
}

//SETUP FUNCTIONS
function ParseIncidents() {
	var incidentParsed;
	var tempKilledInjuredTotal;
	for(var j = 0; j < incidentsData.data.length-1; j++) {
		incidentParsed = parseIncident(incidentsData.data[j]);
		//console.log("===Parsed Incident===");
		//console.log(incidentParsed);
		if (incidentParsed.CityOrCounty === city || incidentParsed.CityOrCounty === county) {
			//console.log("+++Matched Element++");
			//console.log(incidentParsed);
			countLocalIncidents++;
			matchedIncidents.push(incidentParsed);
			tempKilledInjuredTotal = incidentParsed.Killed + incidentParsed.Injured;
			for (var i = 0; i < tempKilledInjuredTotal; i++) {
				bulletIncidents.push(incidentParsed);
			}
			countLocalInjuries += incidentParsed.injured;
			countLocalDeaths += incidentParsed.killed;
		}
	}	
	ready = true;
}

function parseIncident(incident) { //This is all my code. This function just compartmentalizes the code nescessary to parse through each incident reported on twitter into JSON format
	var incidentParsed = { //Stores each incident
		"IncidentDate": incident.IncidentDate,
		"State": incident.State,
		"CityOrCounty": incident.CityOrCounty,
		"Address": incident.Address,
		"Killed": incident.Killed,
		"Injured": incident.Injured,
		"Operations": incident.Operations,
	}
	return incidentParsed;
}

