const API_KEY = "4238b6088b28bd7b216e5c6759811817"

//calls the fetchWeatherAPI function and clears the search input
function search(){
    var searchInput = $("#search-input").val();
    fetchWeatherAPI(searchInput);
    $("#search-input").val("");
}

