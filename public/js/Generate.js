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
var masterIncidentsList; /*All the scraped web data.*/
var countMatchedIncidents = 0; 
var countMatchedInjuries = 0;
var countMatchedDeaths = 0;
var matchedIncidentsList = []; /*All incidents that occured in current query*/
var unmatchedIncidentsList = []; /*All incidents that didn't occur in current query*/


var leftListCount = 0;
var rightListCount = 0;
var minToGenerate = 4;
var flipFlop = false;
var bulletIncidents = [];
var locationObject;
var city = "City";
var state = "State";
var county = "County";
var locationReady = false;
var matchedIncidentsListReady = false;
var hasDisplayedData = false;
var loadingDone = false;
/*==============================*/
function start() {
	WaitToParseData();
	WaitToDisplayData();
}
function startUserInitiated(city, state) {
	/*TODO
	Clear out all relevent variables
	set city and state to be whatever the player entered
	Do all code again
	*/
	ParseForLocalIncidents();
	WaitToDisplayData();
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
	if (gunDataReady) { 
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
	for(var j = 0; j < allIncidentsData.data.length-1; j++) {
		tempIncident = allIncidentsData.data[j];
		if (tempIncident.State == state && (tempIncident.CityOrCounty.includes(city) || tempIncident.CityOrCounty === county)) {
			countLocalIncidents++;
			matchedIncidentsList.push(tempIncident);
			//bulletIncidents.push(tempIncident);
			countLocalInjuries += tempIncident.Injured;
			countLocalDeaths += tempIncident.Killed;
		}
		else {
			matchedIncidentsList.push(tempIncident);
		}
	}	
	matchedIncidentsListReady = true;
}
/*==============================*/




/*===============Display Phase===============*/
/**/
function displayData() {
	clearOldDisplay();
	/*Sets all the UI Text*/
	locationUI.innerHTML = city + ", " + state;
	incidentsUI.innerHTML = countLocalIncidents + " incidents, ";
	injuriesUI.innerHTML = countLocalInjuries + " injures, ";
	deathsUI.innerHTML = countLocalDeaths + " deaths ";
	/*Creates the Bullets in a sphere*/
	var i = 0;
	while (i < countLocalInjuries + countLocalDeaths) {
		generateBullet();
		i++;
	}
	while (bulletIncidents.length > 0) {
		if (flipFlop == false) {
			generateLeftIncidentCard(matchedIncidentsList[0]);
			generateRightFillerCard(unmatchedIncidentsList[0]);
			flipFlop = true;
			leftListCount++;
		}
		else {
			generateRightIncidentCard(matchedIncidentsList[0]);
			generateLeftFillerCard(unmatchedIncidentsList[0]);
			flipFlop = false;
			rightListCount++;
		}
		matchedIncidentsList.shift();
		unmatchedIncidentsList.shift();
	}
	loadingDone = true;
}
/*===============Display Functions===============*/
/*Clears out the two lists and the bullets. UI text is overwritten anyway*/
function clearOldDisplay() {
	leftList.innerHTML = "";
	rightList.innerHTML = "";
	bulletsPlace.innerHTML = "";
}
/*Generate Incident Cards on the Left-hand side*/
function generateLeftIncidentCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fullli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "ltextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "llitext");
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

	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div)
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

	div.appendChild(span1);
	div.appendChild(document.createElement("br"));
	div.appendChild(span2);
	div.appendChild(document.createElement("br"));
	div.appendChild(span3);
	div.appendChild(document.createElement("br"));
	div.appendChild(span4);
	spacerdiv.appendChild(div)
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
}
function generateRightFillerCard(incident) {
	var li = document.createElement("li");
	li.setAttribute("class", "fillerli");
	var spacerdiv = document.createElement("div");
	spacerdiv.setAttribute("class", "rfillertextspacer");
	var div = document.createElement("div");
	div.setAttribute("class", "rfillerlitext");
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
}

/*function generateIncidentCard(incident) {
	if (flipFlop == false) {
		var li = document.createElement("li");
		li.setAttribute("class", "fullli");
		var spacerdiv = document.createElement("div");
		spacerdiv.setAttribute("class", "ltextspacer");
		var div = document.createElement("div");
		div.setAttribute("class", "llitext");
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

		div.appendChild(span1);
		div.appendChild(document.createElement("br"));
		div.appendChild(span2);
		div.appendChild(document.createElement("br"));
		div.appendChild(span3);
		div.appendChild(document.createElement("br"));
		div.appendChild(span4);
		spacerdiv.appendChild(div)
		li.appendChild(spacerdiv);

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
		
		var fillerli = document.createElement("li");
		fillerli.setAttribute("class", "fillerli");
		var spacerdiv = document.createElement("div");
		spacerdiv.setAttribute("class", "rfillertextspacer");
		var div = document.createElement("div");
		div.setAttribute("class", "rfillerlitext");
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
		
		emptyli.setAttribute("class", "lemptyli");
		leftList.appendChild(emptyli);
		flipFlop = false;
		tempRightCount++;
	}
}*/
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












/**/