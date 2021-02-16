"use strict";

import { userselection, changeEvent } from "./utility.js";
import { extractweather, nexthour } from "./support.js";

let inputcity = {
  icon: document.querySelector(".select-city .city-icon img"),
  input: document.querySelector(".select-city-input input"),
  date: document.querySelector(".time-stamp .date"),
  hourminutes: document.querySelector(".time-stamp .hour-min"),
  seconds: document.querySelector(".time-stamp .second"),
  timestate: document.querySelector(".time-stamp .state"),
  tcelcius: document.querySelector(".current-weather .t-celcius strong"),
  tfahrenheit: document.querySelector(".current-weather .t-farenheit strong"),
  humidity: document.querySelector(".current-weather .humidity strong"),
  precipitation: document.querySelector(
    ".current-weather .percipitation strong"
  ),
  timeline: document.querySelector(".timeline"),
};
let invalid = document.getElementById("invalid-city");
let weatherdatapromise = extractweather();
let cityMap = new Map();
weatherdatapromise
  .then(function (data) {
    let isinput = false;
    for (let city of data) {
      let option = document.createElement("option");
      option.value = city.cityName;
      document.getElementById("city-names").appendChild(option);
      cityMap.set(city.cityName, city);
      if (!isinput) {
        inputcity.input.value = option.value;
        nexthour(city.cityName, 5).then((result) => {
          city.nextFiveHrs = result.temperature;
          inputcity.city = new userselection(city);
          inputcity.input.dispatchEvent(changeEvent);
        });
        isinput = true;
      }
    }
  })
  .catch(() => {
    alert("Please try reloading the page.");
  });
setInterval(displaydata, 1000);
inputcity.input.addEventListener("input", validate);
inputcity.input.addEventListener("change", inputvalidation);
inputcity.input.addEventListener("blur", inputvalidation);
/**
 * Displays and loads the data based on timeline
 * @param {boolean} isrefresh denotes the change in timezone
 */
function displaydata(isrefresh = false) {
  let now;
  let [hours, minutes] = inputcity.hourminutes.innerText.split(":");
  let timestate = inputcity.timestate.title;
  let [date, month, year] = inputcity.date.innerText.split("-");
  if (inputcity.city == undefined) return;
  else now = inputcity.city.timestamp();
  const predict = () => {
    weatherdatapromise.then(() => {
      let city = inputcity.city.name;
      city != "" && updateforecast();
    });
  };
  const updateinfo = () => {
    weatherdatapromise.then(() => {
      let city = inputcity.city.name;
      city != "" && updateweather();
    });
  };
  const eachsecond = () => {
    inputcity.seconds.innerHTML = now.seconds;
  };
  const eachhour = () => {
    inputcity.hourminutes.innerHTML = `${now.hours}:${now.minutes}`;
  };
  const updatetimestate = () => {
    inputcity.timestate.src = `assets/General_icons/${now.amPm}State.svg`;
    inputcity.timestate.title = `${now.amPm}`;
  };
  const updatedate = () => {
    inputcity.date.innerHTML = `${now.date}-${now.month}-${now.year}`;
    inputcity.date.title = `${now.month} ${now.date}, ${now.year}`;
  };
  eachsecond();
  if (isrefresh) {
    eachhour();
    updatetimestate();
    updatedate();
  } else {
    if (minutes != now.minutes || hours != now.hours) eachhour();
    if (minutes != now.minutes) updateinfo();
    if (hours != now.hours) predict();
    if (timestate != now.timestate) updatetimestate();
    if (date != now.date || month != now.month || year != now.year)
      updatedate();
  }
}
/**
 * Validate the input city name
 */
function validate() {
  let cityName = inputcity.input.value;
  weatherdatapromise
    .then(function () {
      let isSubsetOfCity = false;
      for (let city of cityMap.keys()) {
        if (city.includes(cityName)) {
          isSubsetOfCity = true;
          break;
        }
      }
      isSubsetOfCity ? hideerrormsg() : showerrormsg();
    })
    .catch(() => {
      alert("Please try reloading the page.");
    });
}
/**
 * Prompts the user for invalid input
 */
function showerrormsg() {
  inputcity.input.classList.add("invalid");
  invalid.style.visibility = "visible";
}
function hideerrormsg() {
  inputcity.input.classList = [];
  invalid.style.visibility = "hidden";
}
function inputvalidation() {
  let cityName = inputcity.input.value;
  weatherdatapromise
    .then(function () {
      if (cityMap.has(cityName)) {
        nexthour(cityName, 5).then((result) => {
          let city = cityMap.get(cityName);
          city.nextFiveHrs = result.temperature;
          inputcity.city = new userselection(city);
          updateweather();
          updateforecast();
        });
      } else {
        inputcity.input.value = inputcity.city.name;
        hideerrormsg();
      }
    })
    .catch((err) => {
      alert("Please try reloading the page.");
    });
}
/**
 * Displays the weather information of selected city
 */
function updateweather() {
  displaydata(true);
  inputcity.icon.style.display = "block";
  inputcity.icon.src = `assets/City_icons/${inputcity.city.name.toLowerCase()}.svg`;
  inputcity.tcelcius.innerHTML = inputcity.city.temperature + " &degC";
  inputcity.tfahrenheit.innerHTML = `${inputcity.city.getFahrenheit()} F`;
  inputcity.humidity.innerHTML = inputcity.city.humidity;
  inputcity.precipitation.innerHTML = inputcity.city.precipitation;
}
/**
 * Updates the next 5 hours forecast of selected city
 */
function updateforecast() {
  let forecastDetails = inputcity.city.nexthour();
  inputcity.timeline.innerHTML = forecast(forecastDetails[0]);
  for (let nThHour = 1; nThHour < forecastDetails.length; nThHour++) {
    inputcity.timeline.innerHTML +=
      `<div class="seperator"> | </div>` + forecast(forecastDetails[nThHour]);
  }
}
/**
 * Updates the weather forecast in next five hours
 * @param {object} forecast
 * @returns Updated forecast-timeline container
 */
function forecast(forecast) {
  let climateicon = forecast.weather == "sunny" ? "Black" : "";
  return `
        <div class="wrapper-time">
          <div class="time"><p>${forecast.hour}</p></div>
          <div class="down">|</div>
          <div class="cliamte-icon">
            <img src="assets/Weather_icons/${forecast.weather}Icon${climateicon}.svg" 
              title="${forecast.weather}" 
              alt="${forecast.weather} icon">
            </img>
          </div>
          <div class="value">${forecast.temperature}</div>
        </div>`;
}
