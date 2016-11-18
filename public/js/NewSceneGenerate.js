/*jslint nomen: true, debug: true,
  evil: false, vars: true */
/*jslint browser:true */
/* Get my HTML References */
var output = document.querySelector("#out");
var bulletEntity = document.querySelector("#BulletsHere");
var textInjuries = document.querySelector("#gunInjuries");
var textDeaths = document.querySelector("#gunDeaths");
var bot = document.querySelector("#bot");
var info = document.querySelector("#info");
var gun = document.querySelector("#gun");
var numk = document.querySelector("#numk");
var numi = document.querySelector("#numi");

/*Initialize my Variables to something I can check against easily */
var countIncidents = 0;
var countInjuries = 0;
var countDeaths = 0;
var atlantaCitiesData;
var gunIncidentsData;
var ready = false;
var incidentsToGenerate = [];
var bulletCounter = 0;
var oldestDate = 0;
var city = 0;
var state = 0;
var intervalID = window.setInterval(myCallback, 2000);
var timeoutID;
var gps = { //Edit this in the code and uncoomment line 82, 83 and 120
    "lat": 41.881832, //change default values otherwise computer will think you're at 0,0
    "lng": -87.623177
};

var states = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"];
function myCallback() { //I use this function as an "Update" function that loops. I wanted a solution for contorling the timing of the bullet generator and this was a reasonable solution
    if (ready == false) {
        if (output.innerHTML == "waiting") //Loading Feedback and Error Feedback
            output.innerHTML = "waiting.";
        else if (output.innerHTML == "waiting.")
            output.innerHTML = "waiting..";
        else if (output.innerHTML == "waiting..")
            output.innerHTML = "waiting...";
        else if (output.innerHTML == "waiting...")
            output.innerHTML = "waiting";
        else
            output.innerHTML = output.innerHTML;
    }
    else {
        if (incidentsToGenerate.length > 0) { //Uses an arry to hold onto incidents to generate. Removes entires it's generated
            var outputString = "";
            if (countInjuries == 0 && countDeaths == 0) {
                out.innerHTML = "Incidents occured but no people were killed or injured by guns in the last 72 hours"; 
            }
            if (countInjuries > 0) {
            		if (countInjuries == 1) {
            			outputString += countInjuries + " person was injured by a gun";
            		}
            		else {
            			outputString += countInjuries + " people were injured by guns";
            		} 

                if (countDeaths == 0) {
                    outputString += " by guns in the last 72 hours";
                }
            }
            if (countDeaths > 0) {
            	if (countDeaths == 1) {
            		console.log("1 death");
            		if (outputString == "")
                	outputString = countDeaths + " person died by a gun in the last 72 hours";
              	else
                	outputString += " and " + countDeaths + " person died by a gun in the last 72 hours";
            	}
            	else {
            		if (outputString == "")
                	outputString = countDeaths + " people died by guns in the last 72 hours";
              	else
                	outputString += " and " + countDeaths + " people died by guns in the last 72 hours";
            	} 
            }
            out.innerHTML = outputString;
            console.log(incidentsToGenerate[0]);
            playGunSoundFXAni(incidentsToGenerate[0].injured, incidentsToGenerate[0].deaths);
            generateBullet(incidentsToGenerate[0]);
            incidentsToGenerate.shift();  
        }
        if (countIncidents == 0) {
            out.innerHTML = "No incidents have occured in the last 72 hours";
        }
    }
}

parseShootings();

function parseShootings() { 
	Papa.parse("data/72Hours-1114.csv", { 
				download: true,
        header: true,
				dynamicTyping: true,
        complete: function(results) {
					console.log(results.data);
          gunIncidentsData = results;
          geoFindMe();
        }
    });
}
function geoFindMe() {
	if (!navigator.geolocation){ //
        console.log("Geolocation is not supported by your browser");
        return;
    }

    function success(position) { //the code inside this function is mine though, because it interacts with my functions
        gps.lat = position.coords.latitude;
        gps.lng = position.coords.longitude;
        console.log('Latitude is ' + gps.lat + ' Longitude is ' + gps.lng)
				output.innerHTML = 'Latitude is ' + gps.lat + ' Longitude is ' + gps.lng;
        codeLatLng();
    };

    function error(error) {
        switch(error.code) {
        case error.PERMISSION_DENIED:
            output.innerHTML = "User denied the request for Geolocation."
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            output.innerHTML = "Location information is unavailable."
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            output.innerHTML = "The request to get user location timed out."
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            output.innerHTML = "An unknown error occurred."
            console.log("An unknown error occurred.");
            break;
        }
    };

    navigator.geolocation.getCurrentPosition(success, error);
}
function codeLatLng() { //Also not my code
    var lat = gps.lat;
    var lng = gps.lng;
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                address = results;
                console.log(address);
                calculateCount();
            }
            else {
                alert('No results found');
            }
        }
        else {
            alert('Geocoder failed due to: ' + status);
        }
    });
    //*/
}
function calculateCount() { 
	var incidentsParsed;
	var tempStateIndex;
	var tempCityIndex;
	for(var j = 0; j < gunIncidentsData.data.length-1; j++) {
		incidentParsed = parseIncident(gunIncidentsData.data[j]);
		for (var i = 0; i < address.length; i++) {
			if (i == 0) {
				for (var k = 0; k < states.length; k++) {
						tempStateIndex = address[i].formatted_address.search(states[k]);
						if (tempStateIndex != -1) {
								tempCityIndex = address[i].formatted_address.indexOf(", ");
								state = states[k];
								city = address[i].formatted_address.substring(tempCityIndex, tempStateIndex);
								city = city.substring(1, city.length);
						}
						if (city != 0)
								break;
				}
			}
			if (address[i].formatted_address.search(incidentParsed.cityorcounty) != -1) {
					countIncidents++;
					incidentsToGenerate.push(incidentParsed);
					countInjuries += incidentParsed.injured;
					countDeaths += incidentParsed.killed;
					break;
			}
		}  
	}
	/*for(var j = 0; j < gunIncidentsData.data.length-1; j++) { 
			incidentParsed = parseIncident(gunIncidentsData.data[j].text, gunIncidentsData.data[j].timestamp); 
			for (var i = 0; i < address.length; i++) {
					if (i == 0) {
							for (var k = 0; k < states.length; k++) {
									tempStateIndex = address[i].formatted_address.search(states[k]);
									if (tempStateIndex != -1) {
											tempCityIndex = address[i].formatted_address.indexOf(", ");
											state = states[k];
											city = address[i].formatted_address.substring(tempCityIndex, tempStateIndex);
											city = city.substring(1, city.length);
									}
									if (city != 0)
											break;
							}
					}
					if (address[i].formatted_address.search(incidentParsed.city) != -1) {
							countIncidents++;
							incidentsToGenerate.push(incidentParsed);
							countInjuries += incidentParsed.injured;
							countDeaths += incidentParsed.deaths;
							break;
					}
			}  
	}*/
	console.log(countIncidents);
	console.log(city);
	bot.innerHTML = city + " " + state;
	console.log(state);
	ready == true;
	writeToText(); 
}
function writeToText() { //Write to the sky with the injuries and deaths counted up in calculateCount
    //textInjuries.setAttribute("text", "The number of gun-related injuries in" + city + state + " since " + oldestDate + ": " + countInjuries);
    //textDeaths.setAttribute("text", "The number of gun-related deaths in" + city + state + " since " + oldestDate + ": " + countDeaths);
    ready = true;
}
function getRandomNumber(min, max) { //Used when creating new bullets to randomize their positon. Copied from Albith code.
    return Math.random() * (max - min) + min;
}
function parseIncident(incident) { //This is all my code. This function just compartmentalizes the code nescessary to parse through each incident reported on twitter into JSON format
	var injured = incident.Injured;
	var killed = incident.Killed;
	var address = incident.Address;
	var cityorcounty = incident.CityOrCounty;
	var incidentdate = incident.IncidentDate;
	var link = incident.Operations; 
	var state = incident.State;

	var incidentParsed = { //Stores each incident
	"injured": injured,
	"killed": killed,
	"address": address,
	"cityorcounty": cityorcounty,
	"incidentdate": incidentdate,
	"link": link,
	"state": state,
	}
	return incidentParsed;
}
function generateBullet(incidentParsed) { //myCallback calls this function for each incident logged in incidentsToGenerate
    console.log(incidentParsed);
    var randomX = getRandomNumber(0, 5);
    var randomZ = getRandomNumber(1, 2);
    var randomPos = randomX + " 0 " + randomZ;
    var name = "Bullet"+bulletCounter;
    if (incidentParsed.killed > 0)
        materialSelected = "color:red;";
    else
        materialSelected = "color:white;";

    var entity = document.createElement("a-collada-model");
    
    entity.setAttribute("position", randomPos);
    entity.setAttribute("rotation", "0 0 0");
    entity.setAttribute("collada-model", "#bullet-dae");
    entity.setAttribute("class", "bullet");
		entity.setAttribute("data-incident", incidentParsed);

    info.innerHTML += incidentParsed.address;
    document.querySelector("#PutBulletsHere").appendChild(entity);
    /* This line is the one that causes duplicates of every incident to be generated, but still colors the bullets. It's confusing. I wanted to use color to distiguish between bullets that represent fatal and non fatal shootings. Oh well */
    //document.querySelector("#Bullet"+bulletCounter).setAttribute("material", materialSelected); //I don't understand why this doesn't work
    
    bulletCounter++;
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
        console("No Injures or Deaths")
    }
    gun.emit('shotsound');
    gun.emit('shot');
}