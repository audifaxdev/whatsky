var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//rClient.keys("whatsky:country:*", function (err, replies) {
//    rClient.get(replies[1], function(err, reply) {
//        console.log(reply);
//    })
//});

module.exports = router;
