var rClientModule = require('redis');
var rConfig = require("../config/redis.json");

var rClient = null;

module.exports = {
  getClient: function () {
    if (!rClient) {
      rClient = rClientModule.createClient({"db": rConfig.redisDb});
      rClient.config("set", "appendonly", "yes");
    }
    return rClient;
  }
};



