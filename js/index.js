const form = document.forms["food-form"];
const btn = document.querySelector("button");
const title = document.querySelector(".title");

btn.addEventListener("click", () => getLocation());

// gets user location
const getLocation = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    title.innerText = "Geolocation is not supported by this browser.";
    return;
  }
};

// injects lat/long into input fields
const showPosition = position => {
  form.elements["latitude"].value = position.coords.latitude;
  form.elements["longitude"].value = position.coords.longitude;

  position ? addTextDiv() : null;
};

// renders input, prompts user for food query
const addTextDiv = () => {
  title.innerText = "What food would you like?";
  form.elements["term"].style.display = "block";
};

form.elements["term"].addEventListener("keyup", () => {
  const btn = document.querySelector("button[type='submit']");
  btn.style.display = "block";
});

// send ajax request to server with form data --> server makes subsequent req to Yelp --> server gives us response
form.addEventListener("submit", e => {
  e.preventDefault();

  fetch("http://localhost:3000/", {
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
    .then(data => renderData(data))
    .catch(err => console.error(err));
});

// helper function for restaurant distance unit conversions
const convertMeters = (conversion, abbrev) => meters =>
  `${(meters / conversion).toFixed(2)} ${abbrev}`;

const metersToMiles = convertMeters(1609.34, "miles");
const metersToKilometers = convertMeters(1000, "km");

// pass JSON data to our render function, which maps over destructured results
const renderData = data => {
  const resultsDiv = document.querySelector(".results");
  console.log(data);

  const table = document.querySelector("table");
  table.style.display = "grid";

  var dog;
  // prettier-ignore
  const result = `
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
