/**
 * Weather App
 *
 * @author: Lucas Bittar @ GA
 *
 * Creation Date: 20150413
 * 
 *
 */

// Global variables
var desc;
var currentTime;
var customLocation;
var searchQuery;
var lat;
var lng;
var backgroundColor;
var dateColor;
var $tempCelsius = $('.temp-c');
var $tempFahrenheit = $('.temp-f');
var $greeting = $('.greeting');
var now = new Date();
var hours = now.getHours();

var icons = new Skycons({"color": "white"});

// Custom variables
var APIaddress = 'https://query.yahooapis.com/v1/public/yql?q';
var APIKey = '30b4902679a9168dbe22e59c425337ef';
var customVars = '&format=json';
var customImageVars = '&imgsz=xxlarge&imgc=color&imgtype=photo&rsz=8&as_filetype=jpg';

// Elements to animate
var elements = ["greeting", "city", "temp", "desc", "units"];

// Days Array
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// Months
var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

// Button actions
$('.unit').on('click', function() {

	var unitTarget = $(this).attr('data-unit');

	if( $(this).hasClass('active') ) {

		//console.log('active');
	
	} else {

		$('.unit').removeClass('active');
		$(this).addClass('active');

		changeUnit(unitTarget);

	}

});

// Check time to search proper image and greeting
if ( hours > 5 && hours < 12) {

	currentTime = 'morning';
	$greeting.html('Good Morning!');
	backgroundColor = 'efdf7e';
	dateColor = '665800';
	changeBackgroundColor();

} else if ( hours >= 12 && hours < 17 ) {

	currentTime = 'afternoon';
	$greeting.html('Good Afternoon!');
	backgroundColor = 'efdf7e';
	dateColor = '665800';
	changeBackgroundColor();

} else if ( hours >= 17 && hours < 19 ) {

	currentTime = 'evening';
	$greeting.html('Good Evening!');
	backgroundColor = 'FF851B';
	dateColor = 'ffbe84';
	changeBackgroundColor();

} else {

	currentTime = 'night';
	$greeting.html('Good Night!');
	backgroundColor = '001f3f';
	dateColor = '0074D9';
	changeBackgroundColor();

}

// Change colors based on time
function changeBackgroundColor() {

	$('.weather-bg-animation').css('background', 'linear-gradient(344deg, rgba(255,255,255,0), #' + backgroundColor + ')');

}

// Function to get user's location
function getLocation() {

	console.log('Fetching location...')

	var geocoder;

	geocoder = new google.maps.Geocoder();

	if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
	} 
	//Get the latitude and the longitude;
	function successFunction(position) {

	    lat = position.coords.latitude;
	    lng = position.coords.longitude;

	    // codeLatLng('-22.856613199999998', '-47.054937499999994');
	    codeLatLng(lat, lng);

	}

	function errorFunction() {

	    alert("Geocoder failed");

	}

	// Get location info and retrieve city's name
	function codeLatLng(lat, lng) {

		var latlng = new google.maps.LatLng(lat, lng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {

			if (status == google.maps.GeocoderStatus.OK) {

			    if (results[1]) {

			    	//find country name
			        for (var i=0; i<results[0].address_components.length; i++) {
				        for (var b=0;b<results[0].address_components[i].types.length;b++) {

				            if (results[0].address_components[i].types[b] == "administrative_area_level_2") {
				       
				                city = results[0].address_components[i];
				                cityName = city.long_name;
				                break;

				            }

				            if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
				       
				                state = results[0].address_components[i];
				                stateName = state.short_name;
				                stateImageQuery = state.long_name;
				                break;

				            }
				        }
			    	}
			    }

			    //city's info
			    console.log('Location found: ' + cityName + ', ' + stateName);

			    customLocation = stateImageQuery;
			    callWeatherAPI(lat, lng);

			    $('title').html('Weather App | ' + cityName + ', ' + stateName);

			} else {

				alert("Geocoder failed due to: " + status);

			}

		});

	}

}

getLocation();

// Animate elements
function fadeOut() {

	$('.loader').removeClass('elements-show');
	$('.loader').addClass('elements-hidden');

	$('.elements-hidden').each(function(i) {

		var toAnimate = $('.' + elements[i]);

		setTimeout(function() {
			toAnimate.removeClass('elements-hidden');
			toAnimate.addClass('elements-show');
		}, 50 * (i + 1));

	});

	setTimeout(function() {
		$('.weather-border').css('background-color', 'rgba(0,0,0,.2)');
	}, 3000);

}

// Call Forecast.io API
function callWeatherAPI(lat, lng) {

	$.ajax({
	   url: 'https://api.forecast.io/forecast/be45cb50a809642825748280ae0a93aa/' + lat + ',' + lng,
	   crossDomain: true,
	   dataType: "jsonp",
	   success: function (data) {

	     var condition = data.currently.summary;
	     var temp = data.currently.apparentTemperature;
	     var icon = data.currently.icon;
	     var dateHMTL = '<span class="date" style="color: #' + dateColor + '"> ' + days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear() + '</span>';
	     desc = condition.text;

	     searchImage();

	     $('.city').html(cityName + ', ' + stateName + ' • ' + dateHMTL);
	     $('.temp-f').html(Math.floor(temp) + '˚F');
	     $('.temp-c').html(fahrenheitCelsius(temp) + '˚C');
	     $('.desc').html('<canvas id="icon" class="icon" width="64" height="64"></canvas>' + condition);
	     
	     icons.add('icon', icon);
	     icons.play();

	   },
	   error: function () {
	     alert('Error loading data. Reload the page.');
	   }

	});

}

// Function to fill background image
function searchImage() {

	// var fullQuery = weatherDescrition + " " + searchQuery + " " + currentTime;
	var fullQuery = customLocation + ' city ' + currentTime;

	console.log('Fetching image for: ' + fullQuery);

	// Call Google Image API
	$.ajax({
	  url:"https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + fullQuery + customImageVars,
	  crossDomain: true,
	  dataType: "jsonp",
	  success: function (data) {

	  	console.log('search complete!');

	  	fadeOut();

	  	var images = data.responseData.results;

	  	var minNumber = 0;
		var maxNumber = 8;

		function randomNumberFromRange(min,max)
		{
		    var randomNumber = Math.floor(Math.random()*(max-min+1)+min);

		    console.log('image URL: ' + images[randomNumber].url);

		    var imageToLoad = images[randomNumber].url;

		    $('.weather-bg').css('background', 'url(' + imageToLoad + ') no-repeat 50% center');

		}

		randomNumberFromRange(minNumber, maxNumber);

	  },
	  error: function () {
	    alert('Error loading data. Reload the page.');
	  }

	});

}

// Function to change unit when clicked
function changeUnit(unitTarget) {

	if ( unitTarget == 'c' ) {

		// console.log('show celsius!');
		
		$tempCelsius.css({
			'transform': 'translateY(0px)',
			'opacity': 1
		});
		$tempFahrenheit.css({
			'transform': 'translateY(15px)',
			'opacity': 0
		});

	} else {

		// console.log('show fahrenheit');
		
		$tempFahrenheit.css({
			'transform': 'translateY(0px)',
			'opacity': 1
		});
		$tempCelsius.css({
			'transform': 'translateY(15px)',
			'opacity': 0
		});

	}

}

// Converts Fahrenheit to Celsius
function fahrenheitCelsius(tempF) {

	var tempC = Math.floor((tempF - 32) * 5/9);

	return tempC;

}