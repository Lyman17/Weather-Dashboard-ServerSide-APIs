const API_KEY = "4238b6088b28bd7b216e5c6759811817"

//calls the fetchWeatherAPI function and clears the search input
function search(){
    var searchInput = $("#search-input").val();
    fetchWeatherAPI(searchInput);
    $("#search-input").val("");
}

//crates a fetch for weather, returning alerts if there are errors, returning API data if status ok, calls functions to display data from API
function fetchWeatherAPI(input){
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + input + "&appid=" + API_KEY +"&units=imperial";
    fetch(queryURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            }else if(response.status == 400){
                alert("HTTP-Error: " + response.status + "\nPlease enter a valid city name in the Search bar.");
            }else if(response.status == 404){
                alert("HTTP-Error: " + response.status + "\nThe city name you entered is not valid.\nPlease enter a valid city name in the Search bar.");
            }else{
                alert("HTTP-Error: " + response.status);
            }
            
        })
        .then(function(data){
            var name = data.name;
            var testKey = "HDF-weatherApp-" + name;
            if(!(localStorage.getItem(testKey))){
                addToList(name);
            }
            fetchForecastAPI(name);
            displayToday(data);
            
        });
}
//creates a fetch for 5day forecast, returns alerts if there are errors, returning API data if status ok, calls functions to display 5-day forecast
function fetchForecastAPI(input){
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input + "&appid=" + API_KEY +"&units=imperial&";
    fetch(queryURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            }else if(response.status == 400){
                alert("HTTP-Error: " + response.status + "\nPlease enter a valid city name in the Search bar.");
            }else if(response.status == 404){
                alert("HTTP-Error: " + response.status + "\nThe city name you entered is not valid.\nPlease enter a valid city name in the Search bar.");
            }else{
                alert("HTTP-Error: " + response.status);
            }
            
        })
        .then(function(data){
            display_5day(data);
        });
    
}

//builds an array of forecast objects that can used to display the average 5-day forecast weather info
function buildForecast(city){
    //API returns 40 forecasts, 3 hour increments.
    console.log(city); 
    var API_forecastList = city.list;
    var today = dayjs().format("MM/DD/YY");
    console.log("today",today)
    var forecasts = [];
    var temp_high = -1000;
    var temp_low = 1000;
    var prevDate = today;
    var curDate = today;
    var avg_windSpeed = 0;
    var avg_humidity = 0;
    var dataPts = 0;
    var iconNum = "";
    var iconsUsed = {
        "clearSky": 0,
        "fewClouds": 0,
        "scatteredClouds": 0,
        "brokenClouds": 0,
        "showerRain": 0,
        "rain": 0,
        "thunderstorm": 0,
        "snow": 0,
        "mist": 0,
    }
   //get date from each object
   for(i = 0; i < API_forecastList.length; i++){
    //save the date of the current forecast in the list and the date of the forecast before it
    //if we are at i=0, then we just save the current date.
    //if the prevDate doesn't equal the current date, then we save the results and reset the process

    //took advice from fellow classmate to use dt_txt instead of dt to fix timezone issue
    //dates formatted "YYYY-MM-DD hh:mm:ss"
    //First split on the space "YYY-MM-DD". 
    //Next split index by "-" -> "YYYY", "MM", "DD"
    curDate = (city.list[i].dt_txt.split(" ", 1))[0];
    curDay = curDate.split("-", 3)[2];
    curDate = curDate.split("-", 3)[1] + "/" + curDay + "/" + curDate.split("-", 3)[0];
    if(i != 0){
        prevDate = (city.list[i-1].dt_txt.split(" ", 1))[0];
        prevDay = prevDate.split("-", 3)[2];
        prevDate = prevDate.split("-", 3)[1] + "/" + prevDay + "/" + prevDate.split("-", 3)[0];
    }else{
        prevDate = curDate;
        prevDay = curDay;
    }

    //if the date is today, then we move on to the next iteration of the loop
    if(curDate == today){
        continue;
    }

    //if the dates have transitioned to the next day, save the previous date's data and reset
    if((curDate != prevDate) && (prevDate != today)){
        iconNum = mostIcon(iconsUsed);
        var newForecast = {
            date: prevDate,
            highTemp: temp_high,
            lowTemp: temp_low,
            windSpeed: (avg_windSpeed / dataPts).toFixed(2), //find the mean wind speed to 2 decimal places
            humidity: (avg_humidity / dataPts).toFixed(0), //finds the mean humidity
            icon: iconNum + "d",
            
        }
        console.log("newForecast", newForecast);
        console.log("iconNum", iconNum);
        forecasts.push(newForecast);
        temp_high = -1000;
        temp_low = 1000;
        avg_windSpeed = 0;
        avg_humidity = 0;
        dataPts = 0;
        iconsUsed = {
            "clearSky": 0,
            "fewClouds": 0,
            "scatteredClouds": 0,
            "brokenClouds": 0,
            "showerRain": 0,
            "rain": 0,
            "thunderstorm": 0,
            "snow": 0,
            "mist": 0,
        }
    }

    if(temp_high < city.list[i].main.temp_max){
        temp_high = city.list[i].main.temp_max;
    }
    if(temp_low > city.list[i].main.temp_min){
        temp_low = city.list[i].main.temp_min;
    }
    avg_windSpeed += city.list[i].wind.speed; //adding up all wind speeds of current day
    avg_humidity += city.list[i].main.humidity; //adding up all humidity
    dataPts++; //getting data points for current day to later divide by

    var icon = (city.list[i].weather[0].icon).substring(0,2);
    switch(icon){
        case "01": iconsUsed.clearSky += 1; break;
        case "02": iconsUsed.fewClouds += 1; break;
        case "03": iconsUsed.scatteredClouds += 1; break;
        case "04": iconsUsed.brokenClouds += 1; break;
        case "09": iconsUsed.showerRain += 1; break;
        case "10": iconsUsed.rain += 1; break;
        case "11": iconsUsed.thunderstorm += 1; break;
        case "13": iconsUsed.snow += 1; break;
        case "50": iconsUsed.mist += 1; break;
        default: console.log("failure", icon);
        
    }
    
}