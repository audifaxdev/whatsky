var rClientModule = require('redis');
var rConfig = require("../config/redis.json");

var geoCodeCountry = require("../modules/geocode-country.js");


module.exports = {
  upsert: function (countryObj, callback) {

    if ( !countryObj.capital.trim() && !countryObj.country.trim()) {
      callback({message: "Missing capital and or country field"});
      return;
    }

    var rClient = rClientModule.createClient({"db": rConfig.redisDb});
    var newLocation = !countryObj.id;

    if (newLocation) {
      //Find next available
      rClient.get("whatsky:country_next_index", function (err, reply) {
        if (err) {
          callback({error: err});
          return;
        }
        countryObj.id = parseInt(reply);

        geoCodeAndWrite();
      });
    } else {
      geoCodeAndWrite();
    }

    function geoCodeAndWrite() {
      geoCodeCountry(countryObj, countryObj.id, function (resultCountry) {
        var redisKey = "whatsky:country:" + countryObj.id;
        rClient.set(redisKey, JSON.stringify(resultCountry));
        if (newLocation) {
          rClient.set("whatsky:country_next_index", resultCountry.id + 1);
        }
        if (callback) {
          callback();
        }
        //console.log(["Geocordinate successfully written for ", resultCountry]);
      });
    }
  },
  clearKey: function(id, callback) {
    var rClient = rClientModule.createClient({"db": rConfig.redisDb});
    var redisKey = "whatsky:country:" + id;
    console.log("DELETING REDIS KEY : " + redisKey);
    rClient.del(redisKey, callback);
  }
};