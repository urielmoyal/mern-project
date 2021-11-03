const API_KEY = "process.env.GOOGLE_API_KEY";
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
