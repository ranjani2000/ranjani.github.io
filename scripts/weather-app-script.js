"use strict";

// module for timestamp
import { timestamp } from './selected-city-weather.js';
// module for citydetalis
import { citydata } from './city-data.js';
  //extract selected city details
  let city = citydata();
  let invalid = document.getElementById('invalid-city');
  //data for invalid input as JSON file
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
  //live time dispaly of selected city
  clock();
  setInterval(clock, 1000);
  //listener
  inputcity.input.addEventListener('change', validate);
  //updating input list
  city.then(function(result){
    let isinput = false;
    for(let city in result){
      let option = document.createElement('option');
      option.value = city.charAt(0).toUpperCase() + city.slice(1);
      document.getElementById('names').appendChild(option);
      if(!isinput){
        inputcity.input.value = option.value;
        inputcity.input.dispatchEvent(changeEvent);
        isinput = true;
      }
    }
  });
 //input validation
  function validate() 
  {
    let cityName = inputcity.input.value.toLowerCase();
    //alert(cityName);
    city.then(function(result){
      if(cityName in result){
        inputcity.input.classList = [];
        invalid.style.display = "none";
        //update information
        updateinfo(result[cityName]);
      }
      else {
        inputcity.input.classList.add('invalid');
        invalid.style.display = "block";
        updateinfo(invalidcity);
      }
    });
  }
  //update 
  function updateinfo(cityDetails)
  {
    //temp conversion
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
    //display city icon
    if(cityDetails.cityName == "NIL") 
    {
        inputcity.icon.style.display = 'none';
    }
      else 
    {
        inputcity.icon.src = `assets/City_icons/${cityDetails.cityName.toLowerCase()}.svg`;
    }  
    //current weather updation
    inputcity.tcelsius.innerHTML = cityDetails.temperature;
    inputcity.tfarenheit.innerHTML =  `${isNaN(tfarenheit)? 'NIL': tfarenheit.toFixed(1)} F`;
    inputcity.humidity.innerHTML = cityDetails.humidity.slice(0,-1);
    inputcity.precipitation.innerHTML = cityDetails.precipitation.slice(0,-1);   
    //forecast
    let initialtime = 0;
    inputcity.timeline.innerHTML = forecast(cityDetails.temperature.slice(0,-2), initialtime);
    cityDetails.nextFiveHrs.forEach((temperature)=>{
      initialtime++;
      inputcity.timeline.innerHTML += `<div class="seperator"> | </div>`;
      inputcity.timeline.innerHTML += forecast(temperature.slice(0,-2), initialtime);
    });
  }
  //live clock display
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
        else if(temp < 23){
          range = 'windy';
        }
        else if(temp < 30){
          range = 'cloudy';
        }
        else{
          range = 'sunny';
          climateicon = 'Black';
        }
        return `<img src="assets/Weather_icons/${range}Icon${climateicon}.svg" title="${range}" alt="${range} icon"></img>`;
      }
      //display forecast
      return `
            <div class="wrapper-time">
              <div class="time"><p>${nexthour()}</p></div>
              <div class="decorator">|</div>
              <div class="climate_icon">${climate()}</div>
              <div class="value">${temp}</div>
            </div>
      `;
  }
  //user preferred weather 
  //Options fetch
  let optedweather = document.querySelectorAll('.option-icon');
  let viewcount = document.querySelector('.display-top input');
  let cards = document.querySelector('.weather-flex-cards');
  let icon = document.querySelector('.option-icon.active');
  let weathertype = [];
  updateweather.call();
  setInterval(updateweather, 1000*60);
  function updateweather()
  {
    weathertype = [];
    city.then(function(data){
      for(let city in data){
        weathertype.push({
          cityName: city,
          type: weather(
            data[city].temperature.slice(0, -2),
            data[city].humidity.slice(0, -1),
            data[city].precipitation.slice(0, -1),
            )
        });
      };
      cityweatherinfo();
    });
  }
  //differentiate weather category
  function weather(temperature, humidity, precipitation){
    if(temperature>28 && humidity < 50 && precipitation>=50)
    {
      return 'sunny';
    }
    else if(temperature>19 && humidity > 50 && precipitation < 50) 
    {
      return 'cloudy';
    }
    else if(temperature<20 && humidity >= 50)
    {
      return 'rainy';
    } 
  }
  viewcount.addEventListener('change', cityweatherinfo);
  //city count update
  function cityweatherinfo()
  {
    if(viewcount.value>10)
    {
      viewcount.value = 10;
    }
    else if(viewcount.value<3) 
    {
      viewcount.value = 3;
    }
     let type = icon.getAttribute('data-category');
     let showinfo = weathertype.filter( x => x.type == type);
     cards.innerHTML = "";
     city.then((data) => {
     let count = 0;
      for(let city of showinfo) {
        cards.innerHTML += infocards(
          data[city.cityName].cityName,
          data[city.cityName].temperature,
          data[city.cityName].humidity,
          data[city.cityName].precipitation,
          data[city.cityName].timeZone
        );
        if(++count == viewcount.value)
          break;
      }
      scroll();
    });
    //weather-info cards
    function infocards(cityName, tempC, humidity, precipitation, timeZone) {
      let dateTime = timestamp(timeZone);
      return `
      <div class="info-card" style="background-image: url('./assets/City_icons/${cityName.toLowerCase()}.svg')">
        <p class="city-info">
          <span class="name">${cityName}</span>
          <span class="weather-icon ${type} first-row">${tempC}</span>
        </p>
        <p class="time">${dateTime.hours}:${dateTime.minutes} ${dateTime.amPm.toUpperCase()}</p>
        <p class="date">${dateTime.date}-${dateTime.month}-${dateTime.year}</p>
        <p class="weather-icon humidity">${humidity}</p>
        <p class="weather-icon percipitation">${precipitation}</p>
      </div>
      `;
    }
  }
  //updation
  function change()
  {
    icon.classList.remove('active');
    this.classList.add('active');
    icon = this;
    cityweatherinfo();
  }
  //Scroll buttons
  let movefront = document.querySelector(".right-arrow");
  let moveback = document.querySelector(".left-arrow");
  movefront.addEventListener('click', function() {
    cards.scrollBy(500,0);
  });
  moveback.addEventListener('click', function(){
    cards.scrollBy(-500,0);
  });
  optedweather.forEach(function(ele) {
    ele.addEventListener('click', change);
  })
  window.addEventListener('resize', scroll);
  //displaying of scroll arrows
  function scroll()
  {
    if(cards.scrollWidth == cards.clientWidth) {
      movefront.style.display = 'none';
      moveback.style.display = 'none';
      cards.style.justifyContent = 'space-evenly';
    }
    else {
      movefront.style.display = 'inline';
      moveback.style.display = 'inline';
      cards.style.justifyContent = 'flex-start';
    }
  }
