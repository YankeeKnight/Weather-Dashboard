var apiKey = "8cc1b2e412b455fccbc66353769a349b";
var today = dayjs().format('MM/DD/YYYY');
console.log(today);
var searchHistoryList = [];

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

        $("#cityDetail").append(currentCity);

        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;

        futureCondition(lat, lon);
    });
}

function futureCondition(lat, lon) {
    var futureURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function (futureResponse) {
        console.log(futureResponse);
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
            var iconURL = `<img scr="https://openweathermap.org/img/w/${cityInfo.icon}.png" 
                            alt="${futureResponse.list[i].weather[0].main}" />`;

            if (someTime.format("HH:mm:ss") === "11:00:00" || someTime.format("HH:mm:ss") === "12:00:00" || someTime.format("HH:mm:ss") === "13:00:00") {
                var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 ms-0 me-1 text-light border rounded border-2" style="width:12rem";>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                </div> `);

                $("#fiveDay").append(futureCard);
            }
        }
    });
}

$("#searchBtn").on("click", function (event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentCondition(city);
    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var searchedCity = $(`<li class="list-group-item">${city}</li>`);
        $("#searchHistory").append(searchedCity);
    };

    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    console.log(searchHistoryList);

});

$(document).ready(function () {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
        console.log(`Last searched city: ${lastSearchedCity}`);
    }
});