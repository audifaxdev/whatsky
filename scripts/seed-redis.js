//#!/usr/bin/env node


var rServerModule = require('redis-server');
var rClientModule = require('redis');

var async =require("async");
var fs = require("fs");
var path = require('path');
var CSVConverter = require("csvtojson").Converter;

var redisDb = 7;
var port = 6379;
var redisServerInstance = new rServerModule(port);

var countryList = null;

var NodeGeocoder = require('node-geocoder');
var timezone = require('node-google-timezone');

var googleApiKey = "AIzaSyDpjghEzY_n8Uh8x3-w8Lx_ObRZPhxClic";

timezone.key(googleApiKey);

var options = {
  provider: 'google',

  // Optionnal depending of the providers
  httpAdapter: 'https', // Default
  apiKey: googleApiKey, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

function readCountryCsvFile(callback) {

  var data = fs.readFileSync(
    path.resolve(__dirname+"/../data/country-list.csv")
  ).toString();

  var csvConverter = new CSVConverter();

//end_parsed will be emitted once parsing finished
  csvConverter.on("end_parsed", function(countries) {
    countryList = countries;
    callback();
  });
  csvConverter.fromString(data,function(err, countries){
    if (err) {
      console.log(err)
    }
  });
}

function seedRedis(callback) {

  redisServerInstance.open(function (error) {

    if (error) {
      throw new Error(error);
    }

    //console.log("The redis server is now up and running on port "+port);

    var rClient = rClientModule.createClient({"db": redisDb});

    rClient.on('connect', function() {
      //console.log('The redis client is connected');

      var count = 0;
      countryList.forEach(function (country, index) {
        var redisKey = "whatsky:country:" + index;
        var searchStr = country.capital + ", " + country.country;

        geocoder.geocode(searchStr)
          .then(function(res) {
            country.latitude = res[0].latitude;
            country.longitude = res[0].longitude;
            timezone.data(
              country.latitude,
              country.longitude,
              0,
              function (err, tz) {
                if (err) {
                  console.log(err);
                  return;
                }
                var tzObj = tz.raw_response
                country.utc = tzObj.rawOffset;
                country.timeOffset = tzObj.dstOffset;
                rClient.set(redisKey, JSON.stringify(country));

                if (++count == countryList.length) {
                  callback();
                }

            });

          })
          .catch(function(err) {
            console.log(err);
          });
      });
    });
  });
}

async.series([
  readCountryCsvFile,
  seedRedis
  ],
  function(err, results){
    process.exit();
});