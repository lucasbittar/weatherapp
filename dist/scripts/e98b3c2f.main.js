function changeBackgroundColor(){$(".weather-bg-animation").css("background","linear-gradient(344deg, rgba(255,255,255,0), #"+backgroundColor+")")}function getLocation(){function a(a){lat=a.coords.latitude,lng=a.coords.longitude,c(lat,lng)}function b(){alert("Geocoder failed")}function c(a,b){var c=new google.maps.LatLng(a,b);d.geocode({latLng:c},function(c,d){if(d==google.maps.GeocoderStatus.OK){if(c[1])for(var e=0;e<c[0].address_components.length;e++)for(var f=0;f<c[0].address_components[e].types.length;f++){if("administrative_area_level_2"==c[0].address_components[e].types[f]){city=c[0].address_components[e],cityName=city.long_name;break}if("administrative_area_level_1"==c[0].address_components[e].types[f]){state=c[0].address_components[e],stateName=state.short_name,stateImageQuery=state.long_name;break}}console.log("Location found: "+cityName+", "+stateName),customLocation=stateImageQuery,callWeatherAPI(a,b),$("title").html("Weather App | "+cityName+", "+stateName)}else alert("Geocoder failed due to: "+d)})}console.log("Fetching location...");var d;d=new google.maps.Geocoder,navigator.geolocation&&navigator.geolocation.getCurrentPosition(a,b)}function fadeOut(){$(".loader").removeClass("elements-show"),$(".loader").addClass("elements-hidden"),$(".elements-hidden").each(function(a){var b=$("."+elements[a]);setTimeout(function(){b.removeClass("elements-hidden"),b.addClass("elements-show")},50*(a+1))}),setTimeout(function(){$(".weather-border").css("background-color","rgba(0,0,0,.2)")},3e3)}function callWeatherAPI(a,b){$.ajax({url:"https://api.forecast.io/forecast/be45cb50a809642825748280ae0a93aa/"+a+","+b,crossDomain:!0,dataType:"jsonp",success:function(a){var b=a.currently.summary,c=a.currently.apparentTemperature,d=a.currently.icon,e='<span class="date" style="color: #'+dateColor+'"> '+days[now.getDay()]+", "+now.getDate()+" "+months[now.getMonth()]+" "+now.getFullYear()+"</span>";desc=b.text,searchImage(),$(".city").html(cityName+", "+stateName+" • "+e),$(".temp-f").html(Math.floor(c)+"˚F"),$(".temp-c").html(fahrenheitCelsius(c)+"˚C"),$(".desc").html('<canvas id="icon" class="icon" width="64" height="64"></canvas>'+b),icons.add("icon",d),icons.play()},error:function(){alert("Error loading data. Reload the page.")}})}function searchImage(){var a=customLocation+" city "+currentTime;console.log("Fetching image for: "+a),$.ajax({url:"https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q="+a+customImageVars,crossDomain:!0,dataType:"jsonp",success:function(a){function b(a,b){var d=Math.floor(Math.random()*(b-a+1)+a);console.log("image URL: "+c[d].url);var e=c[d].url;$(".weather-bg").css("background","url("+e+") no-repeat 50% center")}console.log("search complete!"),fadeOut();var c=a.responseData.results,d=0,e=8;b(d,e)},error:function(){alert("Error loading data. Reload the page.")}})}function changeUnit(a){"c"==a?($tempCelsius.css({transform:"translateY(0px)",opacity:1}),$tempFahrenheit.css({transform:"translateY(15px)",opacity:0})):($tempFahrenheit.css({transform:"translateY(0px)",opacity:1}),$tempCelsius.css({transform:"translateY(15px)",opacity:0}))}function fahrenheitCelsius(a){var b=Math.floor(5*(a-32)/9);return b}var desc,currentTime,customLocation,searchQuery,lat,lng,backgroundColor,dateColor,$tempCelsius=$(".temp-c"),$tempFahrenheit=$(".temp-f"),$greeting=$(".greeting"),now=new Date,hours=now.getHours(),icons=new Skycons({color:"white"}),APIaddress="https://query.yahooapis.com/v1/public/yql?q",APIKey="30b4902679a9168dbe22e59c425337ef",customVars="&format=json",customImageVars="&imgsz=xxlarge&imgc=color&imgtype=photo&rsz=8&as_filetype=jpg",elements=["greeting","city","temp","desc","units"],days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months=["January","February","March","April","May","June","July","August","September","October","November","December"];$(".unit").on("click",function(){var a=$(this).attr("data-unit");$(this).hasClass("active")||($(".unit").removeClass("active"),$(this).addClass("active"),changeUnit(a))}),hours>5&&12>hours?(currentTime="morning",$greeting.html("Good Morning!"),backgroundColor="efdf7e",dateColor="665800",changeBackgroundColor()):hours>=12&&17>hours?(currentTime="afternoon",$greeting.html("Good Afternoon!"),backgroundColor="efdf7e",dateColor="665800",changeBackgroundColor()):hours>=17&&19>hours?(currentTime="evening",$greeting.html("Good Evening!"),backgroundColor="FF851B",dateColor="ffbe84",changeBackgroundColor()):(currentTime="night",$greeting.html("Good Night!"),backgroundColor="001f3f",dateColor="0074D9",changeBackgroundColor()),getLocation();