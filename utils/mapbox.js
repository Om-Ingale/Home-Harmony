// utils/mapbox.js
// Geocodes a city/location string into [lng, lat] coordinates.
// Called in productController when creating or updating a listing.

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

const geocode = async (locationString) => {
  try {
    const response = await geocoder
      .forwardGeocode({ query: locationString, limit: 1 })
      .send();

    const feature = response.body.features[0];
    if (!feature) return null;

    return {
      type:        "Point",
      coordinates: feature.geometry.coordinates, // [lng, lat]
      placeName:   feature.place_name,
    };
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null;
  }
};

module.exports = { geocode };