//#!/usr/bin/env node


var rServerModule = require('redis-server');
var rClientModule = require('redis');

var async =require("async");
var fs = require("fs");
var path = require('path');
var CSVConverter = require("csvtojson").Converter;

var NodeGeocoder = require('node-geocoder');

var redisDb = 7;
var port = 6379;

var redisServerInstance = new rServerModule(port);


var googleApiKey = "AIzaSyDpjghEzY_n8Uh8x3-w8Lx_ObRZPhxClic";

var countryList = null;

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

            if (++count == countryList.length) {
              callback();
            }
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
    console.log("REDIS Seeding is a success!");
    //process.exit();
  });