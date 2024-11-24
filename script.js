const API_KEY = 'dc58adb53f8c4643497064ae46075f0a'; // Replace with your OpenWeatherMap API key
const recentCitiesKey = 'recentCities';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const weatherDetails = document.getElementById('weatherDetails');
const forecastContainer = document.getElementById('forecastContainer');
const currentWeatherSection = document.getElementById('current-weather');
const extendedForecastSection = document.getElementById('extended-forecast');

// Fetch Weather by City Name
function fetchWeatherByCity(city) {
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error('City not found.');
            return response.json();
        })
        .then((data) => {
            displayCurrentWeather(data);
            addToRecentCities(city);
            fetchExtendedForecast(data.coord.lat, data.coord.lon);
        })
        .catch((error) => alert(error.message));
}

// Fetch Weather for Current Location
function fetchWeatherByCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                displayCurrentWeather(data);
                fetchExtendedForecast(latitude, longitude);
            })
            .catch((error) => alert('Failed to fetch weather for your location.'));
    });
}

// Display Current Weather
function displayCurrentWeather(data) {
    weatherDetails.innerHTML = `
        <h3 class="text-lg font-bold">${data.name}</h3>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" class="w-16">
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    currentWeatherSection.classList.remove('hidden');
}

// Fetch Extended Forecast
function fetchExtendedForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then((response) => response.json())
        .then((data) => displayExtendedForecast(data.list))
        .catch((error) => alert('Failed to fetch extended forecast.'));
}

// Display Extended Forecast
function displayExtendedForecast(forecast) {
    forecastContainer.innerHTML = '';
    forecast.slice(0, 5).forEach((item) => {
        const card = document.createElement('div');
        card.className = 'p-4 text-center bg-gray-100 rounded shadow forecast-card';
        card.innerHTML = `
            <p>${new Date(item.dt_txt).toDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather Icon" class="w-16 mx-auto">
            <p>${item.weather[0].description}</p>
            <p>Temp: ${item.main.temp}°C</p>
            <p>Wind: ${item.wind.speed} m/s</p>
            <p>Humidity: ${item.main.humidity}%</p>
        `;
        forecastContainer.appendChild(card);
    });
    extendedForecastSection.classList.remove('hidden');
}

// Add to Recent Cities
function addToRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem(recentCitiesKey, JSON.stringify(cities));
        updateRecentCitiesDropdown();
    }
}

// Update Dropdown
function updateRecentCitiesDropdown() {
    const cities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];
    recentCitiesDropdown.innerHTML = '<option value="">Recently Searched Cities</option>';
    cities.forEach((city) => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
    recentCitiesDropdown.style.display = cities.length ? 'block' : 'none';
}

// Event Listeners
searchBtn.addEventListener('click', () => fetchWeatherByCity(cityInput.value));
currentLocationBtn.addEventListener('click', fetchWeatherByCurrentLocation);
recentCitiesDropdown.addEventListener('change', (e) => {
    const city = e.target.value;
    if (city) fetchWeatherByCity(city);
});

// Initialize
document.addEventListener('DOMContentLoaded', updateRecentCitiesDropdown);
