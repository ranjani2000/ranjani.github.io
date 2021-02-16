/**
 * Extracts weather data for all cities
 * @returns {Promise} Array of objects
 */
export async function extractweather() {
  try {
    let request = {
      method: "GET",
      redirect: "follow",
    };
    let response = await fetch(
      "https://soliton.glitch.me/all-timezone-cities",
      request
    );
    let json = await response.json();
    return json;
  } catch (err) {
    alert("Please try reloading the page.");
  }
}
/**
 * Fetches the current timestamp of selected city
 * @param {string} city cityName
 */
export async function timestamp(city) {
  try {
    let request = {
      method: "GET",
      redirect: "follow",
    };
    let response = await fetch(
      `https://soliton.glitch.me?city=${city}`,
      request
    );
    let json = await response.json();
    return json;
  } catch (err) {
    alert("Please try reloading the page.");
  }
}
/**
 * Extracts the weather data of next five hours
 * @returns {Promise} Object
 */
export async function nexthour(city, hours) {
  try {
    let dateTime = await timestamp(city);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let raw = JSON.stringify({
      city_Date_Time_Name: dateTime.city_Date_Time_Name,
      hours: hours,
    });
    let request = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    let response = await fetch(
      "https://soliton.glitch.me/hourly-forecast",
      request
    );
    let json = await response.json();
    return json;
  } catch (err) {
    alert("Please try reloading the page.");
  }
}