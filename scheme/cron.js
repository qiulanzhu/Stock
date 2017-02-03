/* Third Party Modules */
var later = require('later');
later.date.localTime();
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
  var totalHtmlBody = '';
  async.map(stockArr,
    function (item, done) {
      integrateData.getDataOfHtmlBody(item, function (err, newStockInfo) {
        if (err) {
          logger.error(err);
          return done(err);
        }
        
        stockInfo.get(newStockInfo.code, function (err, stockInfoArr) {
          if(err){
            logger.error(err);
            return done(err);
          }

          stockInfoArr.push(newStockInfo);
          var htmlBody = dataFormat.toHtmlBody(stockInfoArr);
          totalHtmlBody += htmlBody;

          stockInfo.save(newStockInfo, function (err, result) {
            if(err){
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

        if(newStockInfo.rateOfPurchase.split('%')[0] <= config.threshold){
          stockInfo.get(newStockInfo.code, function (err, stockInfoArr) {
            if(err){
              logger.error(err);
              return done(err);
            }

            stockInfoArr.push(newStockInfo);
            var htmlBody = dataFormat.toHtmlBody(stockInfoArr);
            email.sendEmail(htmlBody);
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
  var minuteTask = later.parse.recur().every(30).minute()
    .except().on(9).hour();
  var monthTask = later.parse.recur()
    .every(1).month().last().dayOfMonth()
    .on('18:00:00').time();
  later.setInterval(StockWarn, minuteTask);
  later.setInterval(sendEmailOfStockInfo, monthTask);
};

module.exports = Cron;
