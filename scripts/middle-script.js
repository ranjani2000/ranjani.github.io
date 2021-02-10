"use strict";

import { cityinformation } from "./utility.js";
import { citydata } from "./city-data.js";

let optedweather = document.querySelectorAll(".option-icon");
let viewcount = document.querySelector(".display-top input");
let cards = document.querySelector(".weather-flex-cards");
let icon = document.querySelector(".option-icon.active");
let movefront = document.querySelector(".right-arrow");
let moveback = document.querySelector(".left-arrow");
optedweather.forEach(function (ele) {
  ele.addEventListener("click", change);
});
viewcount.addEventListener("change", cityweatherinfo);
movefront.addEventListener("click", function () {
  cards.scrollBy(300, 0);
});

moveback.addEventListener("click", function () {
  cards.scrollBy(-300, 0);
});
window.addEventListener("resize", scroll);
cards.addEventListener("scroll", scroll);
/**
 * Updates the container with user preference
 */
function change() {
  icon.classList.remove("active");
  this.classList.add("active");
  icon = this;
  cityweatherinfo();
}
cityweatherinfo.call();
setInterval(updateweather, 60000);
function updateweather() {
  cityweatherinfo();
  setTimeout(updateweather, 60000);
}
/**
 * Displays the data split into various weather categories
 */
function cityweatherinfo() {
  citydata().then((data) => {
    let toshow = 0;
    let type = icon.getAttribute("data-category");
    let citiesmap = new Map();
    let typedata = [];
    let showinfo;
    let displayparameter;
    for (let city in data) {
      citiesmap.set(city, new cityinformation(city, data[city]));
      typedata.push({
        cityName: city,
        type: citiesmap.get(city).weatherfilter(),
      });
    }
    showinfo = typedata.filter((x) => x.type == type);
    if (viewcount.value > 10) viewcount.value = 10;
    else if (viewcount.value < 3) viewcount.value = 3;
    switch (type) {
      case "sunny":
        displayparameter = "temperature";
        break;
      case "cloudy":
        displayparameter = "precipitation";
        break;
      case "rainy":
        displayparameter = "humidity";
        break;
      default:
        break;
    }
    showinfo.sort((a, b) => {
      return (
        citiesmap.get(b.cityName)[displayparameter] -
        citiesmap.get(a.cityName)[displayparameter]
      );
    });
    cards.innerHTML = "";
    for (let city of showinfo) {
      cards.innerHTML += infocards(citiesmap.get(city.cityName));
      if (++toshow == viewcount.value) break;
    }
    cards.dispatchEvent(new Event("scroll"));
    /**
     * Renders the preferred weather information
     * @param {Object} citydata Collection of information on particular weather category
     */
    function infocards(citydata) {
      let dateTime = citydata.timestamp();
      let icon = `assets/City_icons/${citydata.key}.svg`;
      return `<div  class="info-card" style="background-image: url('${icon}')">
             <p class="city--info">
                  <span class="name">${citydata.name}</span>
                  <span class="weather-icon ${type} first-row">
                    ${citydata.temperature} &deg;C
                  </span>
                </p>
                <p class="time">
                  ${dateTime.hours}:
                  ${dateTime.minutes} ${dateTime.amPm.toUpperCase()}
                </p>
                <p class="date">
                  ${dateTime.date}-${dateTime.month}-${dateTime.year}
                </p>
                <p class="weather-icon humidity">
                  ${citydata.humidity} %
                </p>
                <p class="weather-icon precipitation">
                  ${citydata.precipitation} %
                </p>
            </div>`;
    }
  });
}
/**
 * Enables scrolling on content overflow
 */
function scroll() {
  if (cards.scrollWidth == cards.clientWidth) {
    movefront.style.display = "none";
    moveback.style.display = "none";
    return;
  } else if (
    cards.scrollWidth <= Math.round(cards.clientWidth + cards.scrollLeft)
  ) {
    movefront.style.display = "none";
    moveback.style.display = "inline";
  } else if (cards.scrollLeft == 0) {
    movefront.style.display = "inline";
    moveback.style.display = "none";
  } else {
    movefront.style.display = "inline";
    moveback.style.display = "inline";
  }
  cards.style.justifyContent = "flex-start";
}
