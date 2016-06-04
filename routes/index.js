var express = require('express');
var rClientModule = require('redis');
var rConfig = require("../config/redis.json");
var moment = require("moment-timezone");

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var rClient = rClientModule.createClient({"db": rConfig.redisDb});

  var countries = [];
  rClient.keys("whatsky:country:*", function (err, replies) {

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

        country.localtime =
          moment.tz(now, country.weather.timezone).format("YYYY-MM-DD HH:mm:ss");

        countries.push(country);

        if (++count == replies.length) {
          res.render(
            'index',
            { title: 'WhatSky', countries: JSON.stringify(countries) }
          );
        }
      })

    });

  });
});

module.exports = router;
