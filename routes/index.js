var express = require('express');
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

  locationModel.getAll(function (countries) {
    res.render(
      'index',
      { title: 'WhatSky', countries: JSON.stringify(countries) }
    );
  });

});

module.exports = router;
