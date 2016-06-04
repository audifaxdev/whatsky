//#!/usr/bin/env node

var rServer = require("./../modules/redis-server.js");
var rClientModule = require("./../modules/redis-client.js");


var async =require("async");
var fs = require("fs");
var path = require('path');
var CSVConverter = require("csvtojson").Converter;

var NodeGeocoder = require('node-geocoder');

var googleApiKey = "AIzaSyDpjghEzY_n8Uh8x3-w8Lx_ObRZPhxClic";

var countryList = null;

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: googleApiKey,
  formatter: null
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
    countryList.forEach(function (country, index) {
      var redisKey = "whatsky:country:" + index;
      var searchStr = country.capital + ", " + country.country;

      geocoder.geocode(searchStr)
        .then(function(res) {

          country.latitude = res[0].latitude;
          country.longitude = res[0].longitude;

          console.log(country);
          rClient.set(redisKey, JSON.stringify(country));

          if (++count == countryList.length) {
            callback();
          }
        })
        .catch(function(err) {
          console.log(err);
          throw new Error(err);
        });
    });
  });

}

async.series([
    readCountryCsvFile,
    rServer.start,
    seedRedis
  ],
  function(err, results){
    console.log("REDIS Seeding is a success!");
    process.exit();
  });