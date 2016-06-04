var NodeGeocoder = require('node-geocoder');

var googleApiKey = "AIzaSyDpjghEzY_n8Uh8x3-w8Lx_ObRZPhxClic";

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: googleApiKey,
  formatter: null
};

var geocoder = NodeGeocoder(options);

module.exports = function geoCodeCountry(country, index, callback) {

  var searchStr = country.capital + ", " + country.country;

  geocoder.geocode(searchStr)
    .then(function(res) {

      country.latitude = res[0].latitude;
      country.longitude = res[0].longitude;

      if (callback) {
        callback(country);
      }
    })
    .catch(function(err) {
      throw new Error(err);
    });
}