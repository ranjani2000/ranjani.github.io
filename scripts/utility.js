export const changeEvent = new Event("change");
/**
 * Base template for city information
 * @param {String} key City name
 * @param {Object} data Deatils of corresponding city
 */
export function cityinformation(key, data) {
  this.key = key;
  this.name = data.cityName;
  this.timeZone = data.timeZone;
  this.temperature = data.temperature.slice(0, -2);
  this.precipitation = data.precipitation.slice(0, -1);
  this.humidity = data.humidity.slice(0, -1);
}
cityinformation.prototype.weatherfilter = function () {
  if (this.temperature > 28 && this.humidity < 50 && this.precipitation >= 50) {
    return "sunny";
  } else if (
    this.temperature > 19 &&
    this.humidity > 50 &&
    this.precipitation < 50
  ) {
    return "cloudy";
  } else if (this.temperature < 20 && this.humidity >= 50) {
    return "rainy";
  }
};
/**
 * Prototype for user selected city
 * @param {String} key Name of the selected city
 * @param {Object} data Details of corresponding city
 */
export function userselection(key, data) {
  cityinformation.call(this, key, data);
  this.nextFiveHrs = data.nextFiveHrs.map((temperature) =>
    temperature.slice(0, -2)
  );
}
userselection.prototype.__proto__ = cityinformation.prototype;
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
cityinformation.prototype.getFahrenheit = function () {
  return (this.temperature * 1.8 + 32).toFixed(1);
};
/**
 * Displays the current time stamp of selected city
 */
cityinformation.prototype.timestamp = function () {
  let options = {
    timeZone: this.timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  let now = new Date().toLocaleString("en-US", options);
  let [monthDate, year, fullTime] = now.split(", ");
  let [month, date] = monthDate.split(" ");
  let [time, amPm] = fullTime.split(" ");
  let [hours, minutes, seconds] = time.split(":");
  return {
    seconds: seconds,
    minutes: minutes,
    hours: hours.padStart(2, 0),
    amPm: amPm.toLowerCase(),
    date: date,
    month: month,
    year: year,
  };
};
userselection.prototype.nexthour = function () {
  let forecast = [];
  let nhour = (timediff) => {
    let now = new Date();
    now.setTime(now.getTime() + timediff * 60 * 60 * 1000);
    return now.toLocaleString("en-US", {
      hour: "numeric",
      timeZone: this.timeZone,
    });
  };
  /**
   * Classifies the forecast weather information
   * @param {number} temperature Predicted temperature of the hour
   */
  function weathertype(temperature) {
    if (temperature < 18) return "rainy";
    else if (temperature < 23) return "windy";
    else if (temperature < 30) return "cloudy";
    else return "sunny";
  }
  forecast.push({
    hour: "NOW",
    temperature: this.temperature,
    weather: weathertype(this.temperature),
  });
  for (let initial = 0; initial < this.nextFiveHrs.length; initial++) {
    forecast.push({
      hour: nhour(initial + 1),
      temperature: this.nextFiveHrs[initial],
      weather: weathertype(this.nextFiveHrs[initial]),
    });
  }
  return forecast;
};
