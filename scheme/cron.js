/* Third Party Modules */
var later = require('later');
var async = require('async');
var _ = require('lodash');

/* Own Modules */
var integrateData = require('../crawler/integrateData');
var dataFormat = require('../crawler/dataFormat');
var email = require('../notify/email');
var stockInfo = require('../database/DB/stockInfo');
var config = require('../config.json');
var logger = require('../logService');

function Cron() {
}

function sendEmailOfStockInfo() {
  var stockArr = _.keys(config.stockCodeAndPurchasePrice);
  async.map(stockArr,
    function (item, done) {
      integrateData.getDataOfHtmlBody(item, function (err, result) {
        if (err) {
          logger.error(err);
          return done(err);
        }

        var htmlBody = dataFormat.toHtmlBody(result);
        email.sendEmail(htmlBody);

        stockInfo.save(result, function (err, result) {
          if(err){
            logger.error(err);
          }
          logger.ndump('result', result);
        });
        done();
      })
    },
    function (err) {
      if (err) {
        return email.sendEmail(err);
      }
    });
}

Cron.startTask = function () {
  var sched = later.parse.recur().every(1).minute();
  // var sched = later.parse.recur()
  //   .every(1).month().last().dayOfMonth()
  //   .on('18:00:00').time();
  later.setInterval(sendEmailOfStockInfo, sched);
};

module.exports = Cron;
