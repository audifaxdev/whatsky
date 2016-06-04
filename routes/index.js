var express = require('express');
var router = express.Router();

var rClientModule = require('redis');
var rConfig = require("../config/redis.json");


/* GET home page. */
router.get('/', function(req, res, next) {
  var rClient = rClientModule.createClient({"db": rConfig.redisDb});

  var countries = [];
  rClient.keys("whatsky:country:*", function (err, replies) {

    var count = 0;

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
