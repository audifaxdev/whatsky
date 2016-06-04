var express = require('express');
var rClientModule = require('redis');
var rConfig = require("../config/redis.json");
var moment = require("moment-timezone");
var locationModel = require("../modules/location-model.js");

var router = express.Router();

router.delete("/locations/:location_id", function (req, res, next) {
  locationModel.clearKey(req.params.location_id, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      res.sendStatus(204);
    }
    res.end();
  });
});

router.post('/locations', function (req, res, next) {
  console.log("router.post('/locations')");
  console.log(req.body);

  locationModel.upsert(req.body, function (err) {
    if (err) {
      res.sendStatus(403);
    } else {
      res.sendStatus(201)
    }
    res.end();
  });
});

router.get('/', function (req, res, next) {
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

        if (country.weather) {
          country.localtime =
            moment.tz(now, country.weather.timezone).format("YYYY-MM-DD HH:mm:ss");
        } else {
          country.localtime = null;
          country.weather = {daily: {summary: null }};
        }

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
