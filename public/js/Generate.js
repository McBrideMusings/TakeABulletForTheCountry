/*jslint browser:true */

/* Get my HTML References */
var incidentsUI = document.querySelector("#incidents");
var injuriesUI = document.querySelector("#injuries");
var deathsUI = document.querySelector("#deaths");
var locationUI = document.querySelector("#location");
var leftList = document.querySelector("#llist");
var rightList = document.querySelector("#rlist");
var bulletsPlace = document.querySelector('#PutBulletsHere');

/*Initialize my Variables to something I can check against easily */
var countLocalIncidents = 0;
var countLocalInjuries = 0;
var countLocalDeaths = 0;
var allIncidentsData;
var flipFlop = false;
var localIncidentsData = [];
var tempLeftCount = 0;
var tempRightCount = 0;
var minToGenerate = 4;

var bulletIncidents = [];
var locationObject;
var city = "City";
var state = "State";
var county = "County";
var cityDataReady = false;
var gunDataReady = false;
var hasDisplayedData = false;
var bulletIterator = 0;
var loadingDone = false;


/*GET GUN DATA*/
function getGunData(data) { /*Stores ALL gun incident data, later matched with local city*/
	allIncidentsData = data;
}
/**/
/*GET AND PARSE LOCATION DATA*/
function getLocationData(results) {
	locationObject = results;
	city = results.city;
	state = results.administrativeLevels.level1long;
	county = results.administrativeLevels.level2long;
	cityDataReady = true;
}
/**/
/*WAIT FOR CITY AND INCIDENT DATA TO BE PARSED*/
function WaitToParseData() { /*Parse Requires City Data, otherwise how would I know which data to display*/
	if ( allIncidentsData && cityDataReady) { 
			ParseForLocalIncidents();
	} else {
			setTimeout( WaitToParseData, 250 );
	}
}
/**/
/*WAIT FOR LOCAL INCIDENTS TO BE MATCHED*/
function WaitToDisplayData(){
	if (gunDataReady) { 
        displayData();
    } else {
        setTimeout( WaitToDisplayData, 250 );
    }
}

function displayData() {
	locationUI.innerHTML = city + ", " + state;
	incidentsUI.innerHTML = countLocalIncidents + " incidents, ";
	injuriesUI.innerHTML = countLocalInjuries + " injures, ";
	deathsUI.innerHTML = countLocalDeaths + " deaths ";
	while (bulletIterator < countLocalInjuries + countLocalDeaths) {
		generateBullet();
		bulletIterator++;
	}
	console.log(bulletIterator);
	while (bulletIncidents.length > 0) {
		generateIncidentCard(bulletIncidents[0]);
		bulletIncidents.shift();
	}
	fillInLists();
	loadingDone = true;
}
/**/


/*GUN DATA PARSING*/
function ParseForLocalIncidents() {
	var incidentParsed;
	var tempKilledInjuredTotal;
	for(var j = 0; j < allIncidentsData.data.length-1; j++) {
		incidentParsed = parseIncident(allIncidentsData.data[j]);
		//console.log("===Parsed Incident===");
		//console.log(incidentParsed);
		if (incidentParsed.State == state) {
			if (incidentParsed.CityOrCounty.includes(city) || incidentParsed.CityOrCounty === county) {
			//console.log("+++Matched Element++");
			//console.log(incidentParsed);
			countLocalIncidents++;
			localIncidentsData.push(incidentParsed);
			tempKilledInjuredTotal = incidentParsed.Killed + incidentParsed.Injured;
			bulletIncidents.push(incidentParsed);
			//console.log(incidentParsed.Injured);
			countLocalInjuries += incidentParsed.Injured;
			countLocalDeaths += incidentParsed.Killed;
			}
		}
	}	
	gunDataReady = true;
}
function parseIncident(incident) { 
	var incidentParsed = {
		"Injured": incident["# Injured"],
		"Killed": incident["# Killed"],
		"Address": incident.Address,
		"CityOrCounty": incident["City Or County"],
		"incidentdate": incident["Incident Date"],
		"Operations": incident.Operations,
		"State": incident.State,
	};
	return incidentParsed;
}
/**/




/*DISPLAY FUNCTIONS*/
/*Generate a list item on alternating sides*/
function generateIncidentCard(incidentParsed) {
	//console.log("generateBullet");
	if (flipFlop == false) {
		var li = document.createElement("li");
		li.setAttribute("class", "fullli");
		
		var spacerdiv = document.createElement("div");
		spacerdiv.setAttribute("class", "ltextspacer");
		
		var div = document.createElement("div");
		div.setAttribute("class", "llitext");
		
		var span1 = document.createElement("span");
		span1.setAttribute("class", "address");	span1.appendChild(document.createTextNode(incidentParsed.Address));
		
		var span2 = document.createElement("span");
		span2.setAttribute("class", "injuries");	span2.appendChild(document.createTextNode(incidentParsed.Injured + " Injured"));
		
		var span3 = document.createElement("span");
		span3.setAttribute("class", "deaths");	span3.appendChild(document.createTextNode(incidentParsed.Killed + " Killed"));
		
		var span4 = document.createElement("span");
		span4.setAttribute("class", "source");
		var a = document.createElement("a");
		a.setAttribute("href", incidentParsed.Operations);
		a.appendChild(document.createTextNode("Source"));
		span4.appendChild(a);
		
		//var img = document.createElement("img");
		//img.setAttribute("src", "assets/bullet-right.png");

		div.appendChild(span1);
		div.appendChild(document.createElement("br"));
		div.appendChild(span2);
		div.appendChild(document.createElement("br"));
		div.appendChild(span3);
		div.appendChild(document.createElement("br"));
		div.appendChild(span4);
		spacerdiv.appendChild(div)
		li.appendChild(spacerdiv);
		//li.appendChild(img);

		leftList.appendChild(li);
		
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "remptyli");
		rightList.appendChild(emptyli);
		
		flipFlop = true;
		tempLeftCount++;
	}
	else {
		var li = document.createElement("li");
		li.setAttribute("class", "fullli");
		
		var spacerdiv = document.createElement("div");
		spacerdiv.setAttribute("class", "rtextspacer");
		
		var div = document.createElement("div");
		div.setAttribute("class", "rlitext");
		
		var span1 = document.createElement("span");
		span1.setAttribute("class", "address");	span1.appendChild(document.createTextNode(incidentParsed.Address));
		
		var span2 = document.createElement("span");
		span2.setAttribute("class", "injuries");	span2.appendChild(document.createTextNode(incidentParsed.Injured + " Injured"));
		
		var span3 = document.createElement("span");
		span3.setAttribute("class", "deaths");	span3.appendChild(document.createTextNode(incidentParsed.Killed + " Killed"));
		
		var span4 = document.createElement("span");
		span4.setAttribute("class", "source");
		var a = document.createElement("a");
		a.setAttribute("href", incidentParsed.Operations);
		a.appendChild(document.createTextNode("Source"));	span4.appendChild(a);

		div.appendChild(span1);
		div.appendChild(document.createElement("br"));
		div.appendChild(span2);
		div.appendChild(document.createElement("br"));
		div.appendChild(span3);
		div.appendChild(document.createElement("br"));
		div.appendChild(span4);
		spacerdiv.appendChild(div)
		li.appendChild(spacerdiv);

		rightList.appendChild(li);
		
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "lemptyli");
		leftList.appendChild(emptyli);
		flipFlop = false;
		tempRightCount++;
	}
}
function fillInLists(){
	while (tempLeftCount < minToGenerate) {
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "lemptyli");
		leftList.appendChild(emptyli);
		tempLeftCount++;
	}
	while (tempRightCount < minToGenerate) {
		var emptyli = document.createElement("li");
		emptyli.setAttribute("class", "remptyli");
		rightList.appendChild(emptyli);
		tempRightCount++;
	}
}

function generateBullet() {
	var radius = 0.3;
	var startX = 0;
	var startY = 0;
	var lengthX = 360;
	var lengthY = 360;
	var min = 0;
	var max = 360;

	var xAngle = THREE.Math.degToRad(Math.random() * lengthX + startX);
	var yAngle = THREE.Math.degToRad(Math.random() * lengthY + startY);
	
	var entity = document.createElement("a-collada-model");
	entity.setAttribute('position', {
		x: radius * Math.cos(xAngle) * Math.sin(yAngle),
		y: radius * Math.sin(xAngle) * Math.sin(yAngle),
		z: radius * Math.cos(yAngle)
	});
	entity.setAttribute('rotation', {
		x: Math.random() * max + min,
		y: Math.random() * max + min,
		z: Math.random() * max + min
	});

	entity.setAttribute("scale",'0.03 0.03 0.03');
	entity.setAttribute("collada-model", "#bullet-dae");
	bulletsPlace.appendChild(entity);
}
/**/