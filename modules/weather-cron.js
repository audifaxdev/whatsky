var rClientModule = require('redis');
var Forecast = require('forecast');

var forecastApiKey = "fecb1cd2c6cd2d818bd68e2a58bb7930";

var forecast = new Forecast({
  service: 'forecast.io',
  key: forecastApiKey,
  units: 'celcius',
  cache: true,
  ttl: {
    minutes: 27,
    seconds: 45
  }
});

var redisDb = 7;

function updateWeatherInfo() {
  console.log("CRON JOB : Update weather info");

  var rClient = rClientModule.createClient({"db": redisDb});

  rClient.on('connect', function() {

    rClient.keys("whatsky:country:*", function (err, replies) {
      replies.forEach(function (redisCountryKey) {

        rClient.get(redisCountryKey, function(err, reply) {
          if (err) {
            return console.warn(["Problem while getting stored country", err]);
          }
          try {
            var country = JSON.parse(reply);
          } catch (e) {
            return console.warn(["Problem while parsing stringified country", e]);
          }
          console.log();
          forecast.get(
            [country.latitude, country.longitude],
            function(err, weather) {
              if(err) {
                return console.warn(["Could not get forecast", err]);
              }
              country.weather = weather;
              rClient.set(redisCountryKey, JSON.stringify(country));

            });
        });
      });
    });
  });
}

module.exports = updateWeatherInfo;