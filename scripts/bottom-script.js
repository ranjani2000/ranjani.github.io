"use strict";

import { cityinformation } from "./utility.js";
import { citydata } from "./city-data.js";

let continentcards = document.querySelector(".continent-info-cards");
let temperaturewise = document.querySelector(".sort-icon.temperature");
let continentwise = document.querySelector(".sort-icon.continent");
temperaturewise.addEventListener("click", sortinfo);
continentwise.addEventListener("click", sortinfo);
/**
 * Fetches the sort order to render contents
 */
function sortinfo() {
  if (this.getAttribute("src").includes("arrowUp")) {
    this.setAttribute(
      "src",
      this.getAttribute("src").replace("arrowUp", "arrowDown")
    );
    this.setAttribute("sort-option", "ascending");
    this.setAttribute("title", "Click to sort in Descending Order");
    this.setAttribute("alt", "Ascending Order");
  } else {
    this.setAttribute(
      "src",
      this.getAttribute("src").replace("arrowDown", "arrowUp")
    );
    this.setAttribute("sort-option", "descending");
    this.setAttribute("title", "Click to sort in Ascending Order");
    this.setAttribute("alt", "Descending Order");
  }
  updatecontinentcard.call();
}
updatecontinentcard.apply();
setInterval(updatecontinentcard, 60000);
/**
 * Update the continent card with contents on sorting order
 */
function updatecontinentcard() {
  let cities;
  let continentsort = continentwise.getAttribute("sort-option");
  let temperaturesort = temperaturewise.getAttribute("sort-option");
  citydata().then(function (data) {
    let displaycount = 0;
    cities = Object.keys(data).reduce((accumulator, city) => {
      let continent = data[city].timeZone.split("/")[0];
      if (accumulator.has(continent)) {
        let cityList = accumulator.get(continent);
        cityList.push(new cityinformation(city, data[city]));
        accumulator.set(
          continent,
          cityList.sort((a, b) => a.temperature - b.temperature)
        );
      } else {
        accumulator.set(continent, [new cityinformation(city, data[city])]);
      }
      return accumulator;
    }, new Map());
    let continents = [...cities.keys()];
    continents.sort();
    if (continentsort != "ascending") continents.reverse();
    continentcards.innerHTML = "";
    for (let continent of continents) {
      let citieslist = [...cities.get(continent)];
      if (temperaturesort != "ascending") citieslist.reverse();
      for (let city of citieslist) {
        continentcards.innerHTML += continentCard(city);
        if (++displaycount == 12) break;
      }
      if (displaycount == 12) break;
      function continentCard(city) {
        let dateTime = city.timestamp();
        return `
          <div class="continent-card">
            <p>
              <span class="continent-name">${continent}</span>
              <span class="continent-temperature">
                ${city.temperature}&deg;C
              </span>
            </p>
            <p>
              <span class="continent-city">
                ${city.name}, 
                ${dateTime.hours}:
                ${dateTime.minutes} ${dateTime.amPm.toUpperCase()}
              </span>
              <span class="continent-humidity">
                <img class="humidity-icon" title="Humidity" src="assets/Weather_icons/humidityIcon.svg" alt="Humidity icon">
                <span class="humidity-value">
                  ${city.humidity}%
                </span>
              </span>
            </p>
          </div>
          `;
      }
    }
  });
}
