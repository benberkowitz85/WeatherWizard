
// Assign APIs to Variables
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'ef5af7d7db3b62ede640279502cadbe6';
// Assign Dom Variables
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var searchButton = document.getElementById('search-button');
var historyEl = document.getElementById('history');
var todayContainer = document.getElementById('today');
var forecastContainer = document.getElementById('forecast');
var searchHistory = [];
// add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_timezone);
dayjs.extend(window.dayjs_plugin_utc);
// function to display current weather fetched from OpenWeather Api
function getCurrentWeather(city, weather) {
    // setting date with dayjs
    var date = dayjs().format('M/D/YYYY');
    // getting values for weather elements from api
    var tempF = weather.main.temp;
    var humidity = weather.main.humidity;
    var  wind = weather.wind.speed;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather.weather[0].main;
    // creating new html elements to contain data from api
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var title = document.createElement('h3');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var humidityEl = document.createElement('p');
    var windEl = document.createElement('p');
    // setting attributes for card & cardBody and adding card body to it
    card.setAttribute('class', 'card mb-3');
    cardBody.setAttribute('class', 'row p-2');
    card.append(cardBody);
    // setting attributes and content to created elements
    title.setAttribute('class', 'card-title');
    title.textContent = `${city} (${date})`;
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    weatherIcon.setAttribute('class', 'weather-image');
    // add img to title
    title.append(weatherIcon);
    tempEl.setAttribute('class', 'card-text');
    tempEl.textContent = `Temp: ${tempF}°F`;
    humidityEl.setAttribute('class', 'card-text');
    humidityEl.textContent = `Humidity: ${humidity} %`;
    windEl.setAttribute('class', 'card-text');
    windEl.textContent = `Wind: ${wind} MPH`;
    // adding elements to cardBody
    cardBody.append(title, tempEl, humidityEl, windEl);
    // clearing input for new city search and adding whole card to today section
    todayContainer.innerHTML = '';
    todayContainer.append(card);
}
// function to display forcasted weather fetched from OpenWeather Api
function getForecastWeather(weather) {
    // getting values for weather elements from api
    var tempF = weather.main.temp;
    var humidity = weather.main.humidity;
    var  wind = weather.wind.speed;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description;
// creating new html elements to contain data from api
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var title = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var humidityEl = document.createElement('p');
    var windEl = document.createElement('p');
    var date = dayjs(weather.dt_txt).format('M/D/YYYY').slice(0, 10);
    title.textContent = date;
    // setting attributes and content to created elements
    col.setAttribute('class', 'col');
    card.setAttribute('class', 'card bg-primary text-white');
    cardBody.setAttribute('class', 'card-body p-2')
    title.textContent = date;
    title.setAttribute('class', 'card-title');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.setAttribute('class', 'card-text');
    tempEl.textContent = `Temp: ${tempF}°F`;
    humidityEl.setAttribute('class', 'card-text');
    humidityEl.textContent = `Humidity: ${humidity} %`;
    windEl.setAttribute('class', 'card-text');
    windEl.textContent = `Wind: ${wind} MPH`;
// appending to parent
    col.append(card);
    card.append(cardBody);
    cardBody.append(title,weatherIcon, tempEl, humidityEl, windEl);
    // adding whole card to today section
    forecastContainer.append(col);
}
// function to loop over data fetched from api and send it to getForecastweather function
function  renderForecast(dailyForecast){
    // clear input for new city search
    forecastContainer.innerHTML = '';
for (var i = 0; i < dailyForecast.length; i++) {
    if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        getForecastWeather(dailyForecast[i]);
    }
}
}
// display search history each in a button
function renderSearchHistory() {
    historyEl.innerHTML = '';
    //show latest search input on top
    for (var i = searchHistory.length - 1; i >= 0; i--) {
        // creating button for each search item
        var Btn = document.createElement('button');
        Btn.setAttribute('aria-controls', 'today forecast');
        Btn.classList.add('history-btn', 'btn-history');
        Btn.setAttribute('data-search', searchHistory[i]);
        Btn.textContent = searchHistory[i];
        historyEl.append(Btn);
    }
}

// function to store search input to local storage
function setStorage(search) {
if (searchHistory.indexOf(search) !== -1) {
    return;
}
searchHistory.push(search);
localStorage.setItem('search-history', JSON.stringify(searchHistory));
renderSearchHistory();
}
// function to get sarch history from local storage
function getStorage() {
    var storageHistory = localStorage.getItem('search-history');
    if (storageHistory) {
        searchHistory = JSON.parse(storageHistory);
    }
    renderSearchHistory();
}

//et lat and lon from data of city
function fetchCoords(data) {
    // store lat & lon
    var lat = data[0].lat;
    var lon = data[0].lon;
    // sending api call to serch by lon & lat
    var apiUrl1 = `${weatherApiRootUrl}/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
    var apiUrl2 = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
    // getting api response 
    fetch(apiUrl1)
    .then(function (res) {
        return res.json();
    })
    // getting city name and all other data from that response to be used in displaying weather
    .then(function (data1) {
        getCurrentWeather(data1.name, data1);
        
    })
    fetch(apiUrl2)
    .then(function (res) {
        return res.json();
    })
    // getting city name and all other data from that response to be used in displaying weather
    .then(function (data2) {
        renderForecast(data2.list);
        
    })
}

// function to get data contains coords from searching by city name
function fetchWeather(search) {
    // calling api url that has city data by it's name
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&appid=${weatherApiKey}`;
    // sending url call to get data
    fetch(apiUrl)
    // converting response to json
    .then(function (res) {
        return res.json();
    })
    // getting city data stored for be used in fetch coords function
    .then(function (data) {
        setStorage(search);
        fetchCoords(data);
    })
}
//check if history search element was clicked or not
function searchHistoryClick (e) {
    if (!e.target.matches('.btn-history')) {
        return;
    }
    var Btn = e.target;
    var search = Btn.getAttribute('data-search');
    fetchWeather(search);
}
//call functions when button clicked
getStorage();
searchButton.addEventListener('click', function(event) {
    var search = searchInput.value;
    event.preventDefault();
    fetchWeather(search);
})
historyEl.addEventListener('click', searchHistoryClick);