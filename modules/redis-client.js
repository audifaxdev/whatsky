var rClientModule = require('redis');
var rConfig = require("../config/redis.json");

module.exports = {
  getClient: function () {
    var rClient = rClientModule.createClient({"db": rConfig.redisDb});
    rClient.config("set", "appendonly", "yes");
    return rClient;
  }
};


