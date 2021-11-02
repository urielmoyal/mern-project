const API_KEY = "AIzaSyBy0lGtvuxcaeQ9s2ZNTE0XJg4wsbqqNqE";
const axios = require("axios");

async function getCoordsForAddress(address) {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const coords = res.data;

  if (!coords || coords.status === "ZERO_RESULT") {
    return {
      lat: "",
      lng: "",
    };
  }

  return coords.results[0].geometry.location;
}

exports.getCoordsForAddress = getCoordsForAddress;
