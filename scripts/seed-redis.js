//#!/usr/bin/env node

var rServer = require("./../modules/redis-server.js");
var rClientModule = require("./../modules/redis-client.js");

var weatherCron = require("./../modules/weather-cron.js");
var geoCodeCountry = require("./../modules/geocode-country.js");

var async =require("async");
var fs = require("fs");
var path = require('path');
var CSVConverter = require("csvtojson").Converter;

var countryList = null;

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
      throw new Error(err);
    }
  });
}

function seedRedis(callback) {

  //console.log("The redis server is now up and running on port "+port);
  var rClient = rClientModule.getClient();

  rClient.on('error', function(err) {
    throw new Error(err);
  });

  rClient.on('connect', function() {

    var count = 0;
    var lastIndex = null;
    countryList.forEach(function (country, index) {

      var redisKey = "whatsky:country:" + index;
      country.id = index;
      geoCodeCountry(country, index, function (resultCountry) {

        rClient.set(redisKey, JSON.stringify(resultCountry));

        if (++count === countryList.length) {
          rClient.set("whatsky:country_next_index", index+1);
          if (callback) {
            callback();
          }
        }
      });
    });
  });

}

function importWeatherTzInfo(callback) {

}

async.series([
    readCountryCsvFile,
    rServer.start,
    seedRedis,
    weatherCron
  ],
  function(err, results){
    console.log("REDIS Seeding is a success!");
    process.exit();
  });