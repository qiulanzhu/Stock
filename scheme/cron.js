/* Third Party Modules */
var later = require('later');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

/* Own Modules */
var integrateData = require('../crawler/integrateData');
var dataFormat = require('../crawler/dataFormat');
var email = require('../notify/email');
var stockInfo = require('../database/DB/stockInfo');
var config = require('../config.json');
var logger = require('../logService');
var configPath = path.join(__dirname, '../config.json');

function Cron() {
}

function sendEmailOfStockInfo() {
  var stockArr = _.keys(config.stockCodeAndPurchasePrice);
  var totalHtmlBody = '';
  async.map(stockArr,
    function (item, done) {
      integrateData.getDataOfHtmlBody(item, function (err, newStockInfo) {
        if (err) {
          logger.error(err);
          return done(err);
        }
        logger.ndump('newstockInfo', newStockInfo);

        stockInfo.get(newStockInfo.code, function (err, stockInfoArr) {
          if (err) {
            logger.error(err);
            return done(err);
          }

          logger.ndump('stockInfoArr', stockInfoArr);
          stockInfoArr.push(newStockInfo);
          var htmlBody = dataFormat.toHtmlBody(stockInfoArr);
          totalHtmlBody += htmlBody;

          stockInfo.save(newStockInfo, function (err, result) {
            if (err) {
              logger.error(err);
            }
            logger.ndump('result', result);
          });
          done();

        });
      })
    },
    function (err) {
      if (err) {
        return email.sendEmail(err);
      }

      email.sendEmail(totalHtmlBody);
    });
}

function StockWarn() {
  var stockArr = _.keys(config.stockCodeAndPurchasePrice);
  async.map(stockArr,
    function (item, done) {
      integrateData.getDataOfHtmlBody(item, function (err, newStockInfo) {
        if (err) {
          logger.error(err);
          return done(err);
        }

        config = JSON.parse(fs.readFileSync(configPath).toString());
        if (config.stockCodeAndPurchasePrice[newStockInfo.code].maxPrice < newStockInfo.currentPrice ){
          config.stockCodeAndPurchasePrice[newStockInfo.code].maxPrice = newStockInfo.currentPrice;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        }

        config = JSON.parse(fs.readFileSync(configPath).toString());
        if ((newStockInfo.currentPrice <= 0.85 * config.stockCodeAndPurchasePrice[newStockInfo.code].maxPrice)
          || (newStockInfo.rateOfPurchase.split('%')[0] <= config.threshold)) {
          stockInfo.get(newStockInfo.code, function (err, stockInfoArr) {
            if (err) {
              logger.error(err);
              return done(err);
            }

            stockInfoArr.push(newStockInfo);
            var htmlBodyForWarn = dataFormat.toHtmlBody(stockInfoArr);
            email.sendEmail(htmlBodyForWarn);
            done();
          });
        }
      })
    },
    function (err) {
      if (err) {
        return email.sendEmail(err);
      }
    });
}

Cron.startTask = function () {
  var arr = [9, 10, 11, 13, 14, 15];
  var basic = {h: arr, m: [0, 30]};
  var exception = [
    {h: [9], m: [0]}
  ];

  var halfHourTask = {
    schedules: [basic],
    exceptions: exception
  };

  var monthTask = later.parse.recur()
    .every(1).month().last().dayOfMonth()
    .on('18:00:00').time();

  var minTask = later.parse.text('every 1 mins');

  later.date.localTime();
  // later.setInterval(StockWarn, minTask);
  later.setInterval(StockWarn, halfHourTask);
  later.setInterval(sendEmailOfStockInfo, monthTask);
};

module.exports = Cron;
