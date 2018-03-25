"use strict";

var form = document.forms["food-form"];
var coordsBtn = document.querySelector("button[name='coords']");
var title = document.querySelector(".title");
var watchID;
var timer;

coordsBtn.addEventListener("click", function() {
  getLocation();
});

// gets user location
var getLocation = () => {
  coordsBtn.innerText = "Getting location...";
  timer = setTimeout(() => {
    coordsBtn.style.color = "teal";
    coordsBtn.innerText = "Almost there...";
  }, 5000);
  var geoError = function() {
    coordsBtn.style.background = "red";
    coordsBtn.style.color = "white";
    coordsBtn.innerText = "Fetch timed out";
  };

  var geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000
  };

  navigator.geolocation.getCurrentPosition(showPosition, geoError, geoOptions);

  if (!navigator.geolocation) {
    title.innerText = `Results can't be fetched`;
  }
};

// inserts computed lat/long (from geolocation API) into input fields
var showPosition = position => {
  form.elements["latitude"].value = position.coords.latitude;
  form.elements["longitude"].value = position.coords.longitude;
  coordsBtn.style.background = "green";
  coordsBtn.style.color = "white";
  coordsBtn.innerText = "Success!";
  clearTimeout(timer);

  position ? addTextDiv() : null;
};

// renders input, prompts user for food query
var addTextDiv = () => {
  title.innerText = "Now, what food would you like?";
  form.elements["term"].style.display = "block";
};

form.elements["term"].addEventListener("keyup", () => {
  const btn = document.querySelector("button[type='submit']");
  btn.style.display = "block";
});

// send ajax request to server with form data --> server makes subsequent req to Yelp --> server gives us response
form.addEventListener("submit", event => {
  event.preventDefault();

  fetch("http://localhost:3000/api/yelp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      term: form.elements["term"].value,
      latitude: form.elements["latitude"].value,
      longitude: form.elements["longitude"].value
    })
  })
    .then(res => res.json())
    .then(data => {
      title.innerText = "Here are the restaurants closest to you";
      renderData(data);
    })
    .catch(err => console.error(err));
});

// helper function for restaurant distance unit conversions
var convertMeters = (conversion, abbrev) => meters =>
  `${(meters / conversion).toFixed(2)} ${abbrev}`;

var metersToMiles = convertMeters(1609.34, "miles");
var metersToKilometers = convertMeters(1000, "km");

// pass JSON data to our render function, which maps over destructured results
var renderData = data => {
  var resultsDiv = document.querySelector(".results");
  console.log(data);

  var table = document.querySelector("table");
  table.style.display = "grid";

  // prettier-ignore
  var result = `
    <ul>
      ${data.businesses.map(({ name, url, price, distance }) => 
       `<li class="list-item">
          <a href=${url}>${name}</a>
          <span>${price ? price : ''}</span>
          <span>${metersToMiles(distance)}</span>
        </li>`)
      .join("")}
    </ul>
  `;

  resultsDiv.innerHTML = result;
};
