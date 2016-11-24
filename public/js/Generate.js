/*jslint browser:true */

/* Get my HTML References */
var incidentsUI = document.querySelector("#incidents");
var injuriesUI = document.querySelector("#injuries");
var deathsUI = document.querySelector("#deaths");
var locationUI = document.querySelector("#location");
var gun = document.querySelector("#gun");
var leftList = document.querySelector("#llist");
var rightList = document.querySelector("#rlist");

/*Initialize my Variables to something I can check against easily */
var countLocalIncidents = 0;
var countLocalInjuries = 0;
var countLocalDeaths = 0;
var incidentsData;
var flipFlop = false;
var matchedIncidents = [];
var ready = false;
var bulletIncidents = [];
var locationObject;
var city = "City";
var state = "State";
var county = "County";
var intervalID = window.setInterval(Update, 1000);
var timeElapsed = 0;
var timeTo = 0;

function getData(data) {
	incidentsData = data;
	timeTo = Math.round(Math.random()*5);
	if (timeTo <= 2)
		timeTo += 3;
}

function Wait() {
	  if ( incidentsData ) {
        ParseIncidents();
    } else {
        setTimeout( Wait, 250 );
    }
}

function Update() {
	console.log(timeElapsed);
	console.log(timeTo);
	if (!ready) {return;}
	else {
		if (timeElapsed === 0) {
			locationUI.innerHTML = city + ", " + state;
			incidentsUI.innerHTML = countLocalIncidents + " incidents, ";
			injuriesUI.innerHTML = countLocalInjuries + " injures, ";
			deathsUI.innerHTML = countLocalDeaths + " deaths ";
		}
		if (bulletIncidents.length > 0) {
			if (timeElapsed === timeTo) {
				playGunSoundFXAni();
				generateBullet(bulletIncidents[0]);
				bulletIncidents.shift();
				timeTo = ((Math.random()*5) + 1);
				timeElapsed = 0;
			}
		}
	}
	timeElapsed++;
}

function getRandomNumber(min, max) { //Used when creating new bullets to randomize their positon. Copied from Albith code.
    return Math.random() * (max - min) + min;
}
function parseLoc(results) {
	locationObject = results.results[0];
	city = locationObject.city;
	state = locationObject.administrativeLevels.level1long;
	county = locationObject.administrativeLevels.level2long;
	Wait();
}

function generateBullet(incidentParsed) { //myCallback calls this function for each incident logged in incidentsToGenerate
	
	if (flipFlop == false) {
		var li = document.createElement("li");
		li.setAttribute("class", "fullli");
		var div1 = document.createElement("div");
		div1.setAttribute("class", "llitext");
		var div2 = document.createElement("div");
		div2.setAttribute("class", "address");
		div2.appendChild(document.createTextNode(incidentParsed.Address));
		var div3 = document.createElement("div");
		div3.setAttribute("class", "injuries");
		div3.appendChild(document.createTextNode(incidentParsed.Injured + " Injured"));
		var div4 = document.createElement("div");
		div4.setAttribute("class", "deaths");
		div4.appendChild(document.createTextNode(incidentParsed.Killed + " Killed"));
		var div5 = document.createElement("div");
		div5.setAttribute("class", "source");
		div5.setAttribute("href", incidentParsed.Operations);
		div5.appendChild(document.createTextNode("Source"));
		var img = document.createElement("img");
		img.setAttribute("src", "assets/bullet-right.png");

		div1.appendChild(div2);
		div1.appendChild(div3);
		div1.appendChild(div4);
		div1.appendChild(div5);
		li.appendChild(div1);
		li.appendChild(img);

		leftList.appendChild(li);
		
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "emptyli");
		rightList.appendChild(emptyli);
		
		flipFlop = true;
	}
	else {
		var li = document.createElement("li");
		li.setAttribute("class", "fullli");
		var div1 = document.createElement("div");
		div1.setAttribute("class", "llitext");
		var div2 = document.createElement("div");
		div2.setAttribute("class", "address");
		div2.appendChild(document.createTextNode(incidentParsed.Address));
		var div3 = document.createElement("div");
		div3.setAttribute("class", "injuries");
		div3.appendChild(document.createTextNode(incidentParsed.Injured));
		var div4 = document.createElement("div");
		div4.setAttribute("class", "deaths");
		div4.appendChild(document.createTextNode(incidentParsed.Killed));
		var div5 = document.createElement("div");
		div5.setAttribute("class", "source");
		div5.setAttribute("href", incidentParsed.Operations);	div5.appendChild(document.createTextNode("Source"));
		var img = document.createElement("img");
		img.setAttribute("src", "assets/bullet-right.png");

		div1.appendChild(div2);
		div1.appendChild(div3);
		div1.appendChild(div4);
		div1.appendChild(div5);
		li.appendChild(div1);
		li.appendChild(img);

		rightList.appendChild(li);
		
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "emptyli");
		leftList.appendChild(emptyli);
		flipFlop = false;
	}
}

function playGunSoundFXAni(injured, deaths) {
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
		if (incidentParsed.State == state) {
			if (incidentParsed.CityOrCounty.includes(city) || incidentParsed.CityOrCounty === county) {
			//console.log("+++Matched Element++");
			//console.log(incidentParsed);
			countLocalIncidents++;
			matchedIncidents.push(incidentParsed);
			tempKilledInjuredTotal = incidentParsed.Killed + incidentParsed.Injured;
			for (var i = 0; i < tempKilledInjuredTotal; i++) {
				bulletIncidents.push(incidentParsed);
			}
			//console.log(incidentParsed.Injured);
			countLocalInjuries += incidentParsed.Injured;
			countLocalDeaths += incidentParsed.Killed;
			}
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

