"use strict";

// module for timestamp
import { timestamp } from './selected-city-weather.js';
// module for citydetalis
import { citydata } from './city-data.js';
  // extract selected city details
  let city = citydata();
  let invalid = document.getElementById('invalid-city');
  // data for invalid input as JSON file
  let invalidcity = {
    cityName: "NIL",
    dateAndTime: "NIL",
    timeZone: "NIL",
    temperature: "NIL°C",
    humidity: "NIL%",
    precipitation: "NIL%",
    nextFiveHrs: [
      "NIL°C",
      "NIL°C",
      "NIL°C",
      "NIL°C"
    ]
  };
  let inputcity = {
    icon: document.querySelector('.select-city .city-icon img'),
    input: document.querySelector('.select-city-input input'),
    date: document.querySelector('.time-stamp .date'),
    hourminutes: document.querySelector('.time-stamp .hour-min'),
    seconds: document.querySelector('.time-stamp .second'),
    state: document.querySelector('.time-stamp .state'),
    tcelsius: document.querySelector('.current-weather .t-celcius strong'),
    tfarenheit: document.querySelector('.current-weather .t-farenheit strong'),
    humidity: document.querySelector('.current-weather .humidity strong'),
    precipitation: document.querySelector('.current-weather .percipitation strong'),
    timeline: document.querySelector('.timeline'),
    timeZone: undefined
  }
  const changeEvent = new Event('change');
  // live time dispaly of selected city
  // clock();
  setInterval(clock, 1000);
  // listener
  inputcity.input.addEventListener('change', validate);
  // updating input list
  city.then(function(result){
    let isinput = false;
    for(let city in result){
      let option = document.createElement('option');
      option.value = city.charAt(0).toUpperCase() + city.slice(1);
      document.getElementById('city-names').appendChild(option);
      if(!isinput){
        inputcity.input.value = option.value;
        inputcity.input.dispatchEvent(changeEvent);
        isinput = true;
      }
    }
  });
 // input validation
  function validate() 
  {
    let cityName = inputcity.input.value.toLowerCase();
    city.then(function(result) {
      if(cityName in result) {
        inputcity.input.classList = [];
        invalid.style.display = "none";
        // update information
        updateinfo(result[cityName]);
      }
      else {
        inputcity.input.classList.add('invalid');
        invalid.style.display = "block";
        updateinfo(invalidcity);
      }
    });
  }
  // update 
  function updateinfo(cityDetails)
  {
    // temp conversion
    let tfarenheit = cityDetails.temperature.slice(0,-2)*1.8 +32;
    // update time
    if(cityDetails.timeZone == "NIL") 
    {
      inputcity.timeZone = undefined;
    }
    else  
    {
      inputcity.timeZone = cityDetails.timeZone;
    }
    clock();
    // display city icon
    if(cityDetails.cityName == "NIL") 
    {
        inputcity.icon.style.display = 'none';
    }
      else 
    {
        inputcity.icon.src = `assets/City_icons/${cityDetails.cityName.toLowerCase()}.svg`;
    }  
    // current weather updation
    inputcity.tcelsius.innerHTML = cityDetails.temperature;
    inputcity.tfarenheit.innerHTML =  `${isNaN(tfarenheit)? 'NIL': tfarenheit.toFixed(1)} F`;
    inputcity.humidity.innerHTML = cityDetails.humidity.slice(0,-1);
    inputcity.precipitation.innerHTML = cityDetails.precipitation.slice(0,-1);   
    // forecast
    let initialtime = 0;
    inputcity.timeline.innerHTML = forecast(cityDetails.temperature.slice(0,-2), initialtime);
    cityDetails.nextFiveHrs.forEach((temperature)=>{
      initialtime++;
      inputcity.timeline.innerHTML += `<div class="seperator"> | </div>`;
      inputcity.timeline.innerHTML += forecast(temperature.slice(0,-2), initialtime);
    });
  }
  // live clock display
  function clock() {
    let now = timestamp(inputcity.timeZone);
    inputcity.hourminutes.innerHTML = `${now.hours}:${now.minutes}`;
    inputcity.seconds.innerHTML = now.seconds;
    inputcity.date.innerHTML = `${now.date}-${now.month}-${now.year}`;
    inputcity.state.src = `assets/General_icons/${now.amPm}State.svg`;
  }
  function forecast(temp, timediff) {
    function nexthour() {
      if(timediff == 0)
      {
        return "NOW";
      }
      else 
      {
        let now = new Date();
        now.setTime(now.getTime() + (timediff*60*60*1000));
        return now.toLocaleString('en-US', {hour: 'numeric', timeZone: inputcity.timeZone});
      }
    }
    function climate() {
        if(temp == "NIL")
          return '';
        let range;
        let climateicon = "";
        if(temp < 18) {
          range = 'rainy';
        }
        else if(temp < 23) {
          range = 'windy';
        }
        else if(temp < 30) {
          range = 'cloudy';
        }
        else {
          range = 'sunny';
          climateicon = 'Black';
        }
        return `<img src="assets/Weather_icons/${range}Icon${climateicon}.svg" title="${range}" alt="${range} icon"></img>`;
    }
      // display forecast
      return `
            <div class="wrapper-time">
              <div class="time"><p>${nexthour()}</p></div>
              <div class="decorator">|</div>
              <div class="climate-icon">${climate()}</div>
              <div class="value">${temp}</div>
            </div>
      `;
  } 
  // continent wise weather info
  let continentcards = document.querySelector('.continent-info-cards');
  let temperaturewise = document.querySelector('.sort-icon.temperature');
  let continentwise = document.querySelector('.sort-icon.continent');
  temperaturewise.addEventListener('click', sortinfo);
  continentwise.addEventListener('click', sortinfo);
  let cities;
  // fetch details
  city.then(function(data) {
    cities = Object.keys(data).reduce((accumulator, city) => {
      let continent = data[city].timeZone.split('/')[0];
      if(accumulator.has(continent)) {
        let citylist = accumulator.get(continent);
        citylist.push(city);
        accumulator.set(continent, citylist.sort((a, b) => {
          return data[a].temperature.slice(0, -2) - data[b].temperature.slice(0, -2)
        }));
      }
      else {
        accumulator.set(continent, [city]);
      }
      return accumulator;
    }, new Map());
  });
  // Sorting cards
  function sortinfo() {
    if(this.getAttribute('src').includes('arrowUp')) {
      this.setAttribute('src', this.getAttribute('src').replace('arrowUp', 'arrowDown'));
      this.setAttribute('sort-option', 'descending');
      this.setAttribute('title', 'Sort in Ascending Order');
      this.setAttribute('alt', 'Descending Order');
    }
    else {
      this.setAttribute('src', this.getAttribute('src').replace('arrowDown', 'arrowUp'));
      this.setAttribute('sort-option', 'ascending');
      this.setAttribute('title', 'Sort in Descending Order');
      this.setAttribute('alt', 'Ascending Order');
    }
    updatecontinentcard.call();
  }
  updatecontinentcard.apply();
  setInterval(updatecontinentcard, 1000*60);
  function updatecontinentcard() {
    let continentsort = continentwise.getAttribute('sort-option');
    let temperaturesort = temperaturewise.getAttribute('sort-option');
    city.then(function(data){
      data = Object.keys(data).map((key)=>{
        return {
            key: key,
            cityName: data[key].cityName,
            humidity: data[key].humidity,
            temperature: data[key].temperature,
            timeZone: data[key].timeZone,
          }
      }).reduce((acc, val) => {
        acc[val['key']] = {
          cityName: val['cityName'],
          humidity: val['humidity'],
          temperature: val['temperature'],
          timeZone: val['timeZone'],
        }
        return acc;
      }, {})
      let continents = [...cities.keys()];
      continents.sort();
      if(continentsort!='ascending') {
        continents.reverse();
      }
      continentcards.innerHTML = "";
      let count = 0;
      for(let continent of continents) {
        let citieslist = [...cities.get(continent)];
        if(temperaturesort != 'ascending') {
          citieslist.reverse();
        }
        for(let city of citieslist) {
          continentcards.innerHTML += continentCard(city);
          if (++count==12)
            break;
        }
        if (count==12)
            break;
        function continentCard(city) {
          let dateTime = timestamp(data[city].timeZone);
          return `
          <div class="continent-card">
            <div>
              <span class="continent-name">${continent}</span>
              <span class="continent-temperature">${data[city].temperature}</span>
            </div>
            <p>
              <span class="continent-city">${data[city].cityName}, ${dateTime.hours}:${dateTime.minutes} ${dateTime.amPm.toUpperCase()}</span>
              <span class="continent-humidity">
                <img class="humidity-icon" title="Humidity" src="./assets/Weather_icons/humidityIcon.svg" alt="Humidity icon">
                <span class="humidity-value">${data[city].humidity}</span>
              </span>
            </p>
          </div>
          `;
        }
      }
    });
  }