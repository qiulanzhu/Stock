/* Third Party Modules */
var superagent = require('superagent');

/* Own Modules */
var config = require('../config.json');
var logger = require('../logService');

function DateAndTime() {
  
}

DateAndTime.checkHoliday = function (dataTime, callback) {
  var url = config.checkHolidayAddress;
  logger.ndump('url', url);

  superagent
    .get(url)
    .query('d=' + dataTime)
    .timeout(15000)
    .end(function(err, res){
      if(err){
        logger.error(err);
        logger.debug(err.stack);
        return callback(err);
      }
      if(res.status === 200){
        callback(null, res.text);
      }else {
        callback('error:status=' + res.status)
      }
    });
};

module.exports = DateAndTime;