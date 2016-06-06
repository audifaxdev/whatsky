var uuid = require('node-uuid');
var rClientService = require('../modules/redis-client.js');

var geoCodeCountry = require('../modules/geocode-country.js');
var moment = require('moment-timezone');


module.exports = {

  getAll: function (callback) {
    var rClient = rClientService.getClient();

    rClient.keys('whatsky:country:*', function (err, replies) {

      var countries = [];
      var count = 0;
      var now = new Date();

      replies.forEach(function (redisKey) {

        rClient.get(redisKey, function(err, value) {

          if (err) {
            throw new Error(err);
            //todo return http err
          }

          try {
            var country = JSON.parse(value);
          } catch(e) {
            //todo return http err
            throw new Error(e);
          }

          if (country.weather) {
            country.localtime =
              moment.tz(now, country.weather.timezone).format('YYYY-MM-DD HH:mm:ss');
          } else {
            country.localtime = null;
            country.weather = {daily: {summary: null }};
          }

          countries.push(country);

          if (++count == replies.length && callback) {
            callback(countries);
          }
        });

      });

    });
  },
  upsert: function (countryObj, callback) {

    if ( !countryObj.capital.trim() && !countryObj.country.trim()) {
      callback({message: 'Missing capital and or country field'});
      return;
    }

    var rClient = rClientService.getClient();

    if (!countryObj.id) {
      countryObj.id = uuid.v4();
    }

    geoCodeCountry(countryObj, countryObj.id, function (resultCountry) {

      var redisKey = 'whatsky:country:' + countryObj.id;

      rClient.set(redisKey, JSON.stringify(resultCountry));

      if (callback) {
        callback();
      }
    });

  },
  clearKey: function(id, callback) {
    var rClient = rClientService.getClient();

    rClient.del('whatsky:country:' + id, callback);
  }
};