/*jslint browser:true */

/*===============Initilize my Useful HTML References===============*/
var incidentsUI = document.querySelector("#incidents");
var injuriesUI = document.querySelector("#injuries");
var deathsUI = document.querySelector("#deaths");
var locationUI = document.querySelector("#location");
var leftList = document.querySelector("#llist");
var rightList = document.querySelector("#rlist");
var bulletsPlace = document.querySelector('#PutBulletsHere');
/*==============================*/





/*===============Initilize any variable I'll be using===============*/
/*These first two variables should never be overwritten after they're set. They're the raw data basically*/
var masterIncidentsList; /*All the scraped web data.*/
var locationObject; /*All Location Data*/

/*This data is reset by the client's actions*/
var city = "City";
var state = "State";
var county = "County";

/*All of this data is reset to default the client picks a new location*/
var countMatchedIncidents = 0; 
var countMatchedInjuries = 0;
var countMatchedDeaths = 0;
var matchedIncidentsList = []; /*All incidents that occured in current query*/
var unmatchedIncidentsList = []; /*All incidents that didn't occur in current query*/
var flipFlop = false;
var locationReady = false;
var matchedIncidentsListReady = false;
var loadingDone = false;

var statewide = false;
/*==============================*/
function start() {
	console.log("==Start==");
	statewide = false;
	clearHTMLLists();
	WaitToParseData();
	WaitToDisplayData();
}
function startUserInitiated(cityNew, stateNew, countyNew) {
	countMatchedIncidents = 0; 
	countMatchedInjuries = 0;
	countMatchedDeaths = 0;
	matchedIncidentsList = []; /*All incidents that occured in current query*/
	unmatchedIncidentsList = []; /*All incidents that didn't occur in current query*/
	flipFlop = false;
	locationReady = true; /*Location is prdetermined so this is set to true.*/
	matchedIncidentsListReady = false;
	loadingDone = false;
	statewide = false;
	/*Set all of the location data. We're skipping the locationObject because in most cases this data is preset*/
	city = cityNew;
	state = stateNew;
	county = countyNew;
	
	clearHTMLLists();
	fadein();
	ParseForLocalIncidents();
	WaitToDisplayData();
}
function startUserInitiatedStatewide() {
	countMatchedIncidents = 0; 
	countMatchedInjuries = 0;
	countMatchedDeaths = 0;
	matchedIncidentsList = []; /*All incidents that occured in current query*/
	unmatchedIncidentsList = []; /*All incidents that didn't occur in current query*/
	flipFlop = false;
	locationReady = true; /*Location is prdetermined so this is set to true.*/
	matchedIncidentsListReady = false;
	loadingDone = false;
	statewide = true;
	/*Set all of the location data. We're skipping the locationObject because in most cases this data is preset*/
	city = "";
	state = locationObject.administrativeLevels.level1long;
	county = "";
	
	clearHTMLLists();
	fadein();
	ParseForLocalIncidents();
	WaitToDisplayData();
}
/*Clears out the two lists and the bullets. UI text is overwritten anyway*/
function clearHTMLLists(){
	leftList.innerHTML = "";
	rightList.innerHTML = "";
	bulletsPlace.innerHTML = "";
}

/*===============Wait Phase===============*/
/*Parse Requires City Data, otherwise how would I know which data to display*/
function WaitToParseData() { 
	if ( masterIncidentsList && locationReady) { 
			ParseForLocalIncidents();
	} else {
			setTimeout( WaitToParseData, 250 );
	}
}
/**/
/*Waits for all incidents to be matched before proceeding to the display step*/
function WaitToDisplayData(){
	if (matchedIncidentsListReady) { 
        displayData();
    } else {
        setTimeout( WaitToDisplayData, 250 );
    }
}
/*Setter functions are called when data is passed from the server to the client, starting at the index.html page.*/
/*setGunData just sets gundata. It can't do more because it can't match this data with the client's city before goolgle responds, and that always takes longer*/
function setGunData(data) { 
	masterIncidentsList = data;
}
/*setLocationData does just that. Notice that I don't need many datapoints to do this work*/
function setLocationData(results) {
	locationObject = results;
	city = results.city;
	state = results.administrativeLevels.level1long;
	county = results.administrativeLevels.level2long;
	locationReady = true;
}
/*==============================*/


/*===============Match Phase===============*/
/*Setter functions are called when data is passed from the server to the client, starting at the index.html page.*/
function ParseForLocalIncidents() {
	var tempIncident;
	console.log("==ParseForLocalIncidents==");
	for(var j = 0; j < masterIncidentsList.data.length-1; j++) {
		tempIncident = masterIncidentsList.data[j];
		if (tempIncident.State === state) {
			if (statewide === true) {
				countMatchedIncidents++;
				matchedIncidentsList.push(tempIncident);
				//bulletIncidents.push(tempIncident);
				console.log(tempIncident.Injured);
				console.log(tempIncident.Killed);
				countMatchedInjuries += Number(tempIncident.Injured);
				countMatchedDeaths += Number(tempIncident.Killed);
			}
			else if (tempIncident.CityOrCounty.includes(city) || tempIncident.CityOrCounty === county) {
				countMatchedIncidents++;
				matchedIncidentsList.push(tempIncident);
				//bulletIncidents.push(tempIncident);
				console.log(tempIncident.Injured);
				console.log(tempIncident.Killed);
				countMatchedInjuries += Number(tempIncident.Injured);
				countMatchedDeaths += Number(tempIncident.Killed);
			}
		}
		else {
			unmatchedIncidentsList.push(tempIncident);
		}
	}	
	console.log("====Matched List====");
	console.log(matchedIncidentsList);
	console.log("Incidents,Injuries,Deaths");
	console.log(countMatchedIncidents);
	console.log(countMatchedInjuries);
	console.log(countMatchedDeaths);
	matchedIncidentsListReady = true;
	console.log("======");
}
/*==============================*/




/*===============Display Phase===============*/
function displayData() {
	/*Sets all the UI Text*/
	if (statewide === true) {
		locationUI.innerHTML = state;
	}
	else {
		locationUI.innerHTML = city + ", " + state;
	}
	incidentsUI.innerHTML = countMatchedIncidents + " incidents, ";
	injuriesUI.innerHTML = countMatchedInjuries + " injuries, ";
	deathsUI.innerHTML = countMatchedDeaths + " deaths ";
	/*Creates the Bullets in a sphere*/
	var i = 0;
	while (i < countMatchedInjuries + countMatchedDeaths) {
		generateBullet();
		i++;
	}
	console.log("About to Generate");
	while (matchedIncidentsList.length > 0) {
		console.log(matchedIncidentsList[0]);
		if (flipFlop === false) {
			generateLeftIncidentCard(matchedIncidentsList[0]);
			generateRightFillerCard(unmatchedIncidentsList[0]);
			flipFlop = true;
		}
		else {
			generateRightIncidentCard(matchedIncidentsList[0]);
			generateLeftFillerCard(unmatchedIncidentsList[0]);
			flipFlop = false;
		}
		matchedIncidentsList.shift();
		unmatchedIncidentsList.shift();
	}
	while (unmatchedIncidentsList.length > 0) {
		if (flipFlop === false) {
			generateRightFillerCard(unmatchedIncidentsList[0]);
			flipFlop = true;
		}
		else {
			generateLeftFillerCard(unmatchedIncidentsList[0]);
			flipFlop = false;
		}
		unmatchedIncidentsList.shift();
	}
	console.log("loadingDone");
	loadingDone = true;
}
/*===============Display Functions===============*/
/*Generate Incident Cards on the Left-hand side*/
function generateLeftIncidentCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fullli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "ltextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "llitext");
	var span0 = document.createElement("span");
	span0.setAttribute("class", "citystate");	
	span0.appendChild(document.createTextNode(incident.CityOrCounty + ", " + incident.State));
	var span1 = document.createElement("span");
	span1.setAttribute("class", "address");	
	span1.appendChild(document.createTextNode(incident.Address));
	var span2 = document.createElement("span");
	span2.setAttribute("class", "injuries");	
	span2.appendChild(document.createTextNode(incident.Injured + " Injured"));
	var span3 = document.createElement("span");
	span3.setAttribute("class", "deaths");	
	span3.appendChild(document.createTextNode(incident.Killed + " Killed"));
	var span4 = document.createElement("span");
	span4.setAttribute("class", "source");
	var a = document.createElement("a");
	a.setAttribute("href", incident.Source);
	a.setAttribute("target", "_blank");
	a.appendChild(document.createTextNode("Source"));
	span4.appendChild(a);

	div.appendChild(span0);
	div.appendChild(document.createElement("br"));
	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div);
	li.appendChild(spacerdiv);

	leftList.appendChild(li);
}
function generateLeftFillerCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fillerli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "lfillertextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "lfillerlitext");
	var span0 = document.createElement("span");
	span0.setAttribute("class", "fillercitystate");	
	span0.appendChild(document.createTextNode(incident.CityOrCounty + ", " + incident.State));
	var span1 = document.createElement("span");
	span1.setAttribute("class", "filleraddress");	span1.appendChild(document.createTextNode(incident.Address));
	var span2 = document.createElement("span");
	span2.setAttribute("class", "fillerinjuries");	span2.appendChild(document.createTextNode(incident.Injured + " Injured"));
	var span3 = document.createElement("span");
	span3.setAttribute("class", "fillerdeaths");	span3.appendChild(document.createTextNode(incident.Killed + " Killed"));
	var span4 = document.createElement("span");
	span4.setAttribute("class", "fillersource");
	var a = document.createElement("a");
	a.setAttribute("href", incident.Source);
	a.setAttribute("target", "_blank");
	a.appendChild(document.createTextNode("Source"));
	span4.appendChild(a);

	div.appendChild(span0);
	div.appendChild(document.createElement("br"));
	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div);
	li.appendChild(spacerdiv);

	leftList.appendChild(li);
}
/*Generate Incident Cards on the right-hand side*/
function generateRightIncidentCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fullli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "rtextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "rlitext");
	var span0 = document.createElement("span");
	span0.setAttribute("class", "citystate");	
	span0.appendChild(document.createTextNode(incident.CityOrCounty + ", " + incident.State));
	var span1 = document.createElement("span");
	span1.setAttribute("class", "address");	span1.appendChild(document.createTextNode(incident.Address));
	var span2 = document.createElement("span");
	span2.setAttribute("class", "injuries");	span2.appendChild(document.createTextNode(incident.Injured + " Injured"));
	var span3 = document.createElement("span");
	span3.setAttribute("class", "deaths");	span3.appendChild(document.createTextNode(incident.Killed + " Killed"));
	var span4 = document.createElement("span");
	span4.setAttribute("class", "source");
	var a = document.createElement("a");
	a.setAttribute("href", incident.Source);
	a.setAttribute("target", "_blank");
	a.appendChild(document.createTextNode("Source"));	
	span4.appendChild(a);

	div.appendChild(span0);
	div.appendChild(document.createElement("br"));
	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div);
	li.appendChild(spacerdiv);

	rightList.appendChild(li);
}
function generateRightFillerCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fillerli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "rfillertextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "rfillerlitext");
	var span0 = document.createElement("span");
	span0.setAttribute("class", "fillercitystate");	
	span0.appendChild(document.createTextNode(incident.CityOrCounty + ", " + incident.State));
	var span1 = document.createElement("span");
	span1.setAttribute("class", "filleraddress");	
	span1.appendChild(document.createTextNode(incident.Address));
	var span2 = document.createElement("span");
	span2.setAttribute("class", "fillerinjuries");	
	span2.appendChild(document.createTextNode(incident.Injured + " Injured"));
	var span3 = document.createElement("span");
	span3.setAttribute("class", "fillerdeaths");	
	span3.appendChild(document.createTextNode(incident.Killed + " Killed"));
	var span4 = document.createElement("span");
	span4.setAttribute("class", "fillersource");
	var a = document.createElement("a");
	a.setAttribute("href", incident.Source);
	a.setAttribute("target", "_blank");
	a.appendChild(document.createTextNode("Source"));	
	span4.appendChild(a);

	div.appendChild(span0);
	div.appendChild(document.createElement("br"));
	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div);
	li.appendChild(spacerdiv);

	rightList.appendChild(li);
}
/*Ripped straight from https://github.com/ngokevin/kframe/tree/master/components/randomizer/*/
/*I can't pretend I know anything about 3D rotation math. Quaternions scare me.*/
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
/*==============================*/