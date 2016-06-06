//#!/usr/bin/env node

var rServer = require("./../modules/redis-server.js");
var rClientService = require("./../modules/redis-client.js");

var weatherCron = require("./../modules/weather-cron.js");
var locationModel = require("./../modules/location-model.js");

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

  var rClient = rClientService.getClient();

  rClient.on('error', function(err) {
    throw new Error(err);
  });

  rClient.on('connect', function() {

    var count = 0;

    countryList.forEach(function (country) {

      locationModel.upsert(country, function () {

        if (++count === countryList.length) {
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