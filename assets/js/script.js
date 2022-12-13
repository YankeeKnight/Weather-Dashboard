// Declared variables
var apiKey = "8cc1b2e412b455fccbc66353769a349b";
var today = dayjs().format('MM/DD/YYYY');
console.log(today);
var cities = [];
var searchHistoryElement = document.querySelector("#searchHistory");
var searchButtonElement = document.querySelector("#searchBtn");
var cityDetail = document.querySelector("#cityDetail");
var fiveDayHead = document.querySelector("#fiveDayHead");
var cbManny = document.querySelector("#manny");

// Ensures no content can be viewed until a search is executed
function init() {
    cityDetail.style.display = "none";
    fiveDayHead.style.display = "none";
    cbManny.style.display = "none";
}

// API called to provide current conditions for the city searched
function currentCondition(city) {


    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (cityWeatherResponse) {
        console.log(cityWeatherResponse);

        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();

        var iconCode = cityWeatherResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        var currentCity = $(`<h2 id="currentCity"> 
                          ${cityWeatherResponse.name} 
                          ${today} <img src="${iconURL}" 
                          alt="${cityWeatherResponse.weather[0].description}" /></h2>
                          <p>Temp: ${cityWeatherResponse.main.temp} °F</p>
                          <p>Wind: ${cityWeatherResponse.wind.speed} MPH</p>
                          <p>Humidity: ${cityWeatherResponse.main.humidity} \%<p>`);

        cityDetail.style.display = "block";
        $("#cityDetail").append(currentCity);

        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;

        futureCondition(lat, lon);
    });
}

// Forecast API called to provide the 5 Day Forecast for city searched
function futureCondition(lat, lon) {
    var futureURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function (futureResponse) {
        console.log(futureResponse);
        fiveDayHead.style.display = "block";
        $("#fiveDay").empty();

        for (let i = 0; i < futureResponse.list.length; i++) {
            let dayData = futureResponse.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = futureResponse.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let someTime = dayjs.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);

            var cityInfo = {
                date: futureResponse.list[i].dt,
                icon: futureResponse.list[i].weather[0].icon,
                temp: futureResponse.list[i].main.temp,
                wind: futureResponse.list[i].wind.speed,
                humidity: futureResponse.list[i].main.humidity
            };

            var currDate = dayjs.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" 
                            alt="${futureResponse.list[i].weather[0].description}">`;

            if (someTime.format("HH:mm:ss") === "11:00:00" || someTime.format("HH:mm:ss") === "12:00:00" || someTime.format("HH:mm:ss") === "13:00:00") {
                var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 ms-0 me-1 text-light" style="width:11.5rem";>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                </div>`);

                $("#fiveDay").append(futureCard);
                cbManny.style.display = "block";
            }
        }
    });
}

// Handles the input in the city field
var formSubmitHandler = function (event) {
    event.preventDefault();
    var city = $("#enterCity").val().trim();
    if (city) {
        currentCondition(city);
        cities.unshift({ city });
        $("#enterCity").val('');
        saveSearch();
        pastSearch(city);
    } else if (city === "") {
        alert("Please enter a City");
    }
}

// Saves the cities searched to local storage
var saveSearch = function () {
    localStorage.setItem("cities", JSON.stringify(cities));
}

// Dynamically creates usable buttons with cities searched
var pastSearch = function (pastSearch) {
    pastSearchElement = document.createElement("button");
    pastSearchElement.textContent = pastSearch;
    pastSearchElement.classList = "d-flex justify-content-center w-100 historyBtn border rounded p-2";
    pastSearchElement.setAttribute("data-city", pastSearch);
    pastSearchElement.setAttribute("type", "submit");

    searchHistoryElement.prepend(pastSearchElement);
}

// Handles when a button in the saved search is clicked
var pastSearchHandler = function (event) {
    var city = event.target.getAttribute("data-city");
    if (city) {
        currentCondition(city);
    }
}

// Event Listeners
searchButtonElement.addEventListener("click", formSubmitHandler);

// Allows search to run when enter key is pressed while user is inside input box
$("#enterCity").keyup(function (event) {
    if (event.keyCode === 13) {
        $("#searchBtn").click();
    }
});
searchHistoryElement.addEventListener("click", pastSearchHandler);

init();