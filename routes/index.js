/* Third Party Modules */
var express = require('express');
var router = express.Router();
var async = require('async');
var moment = require('moment');
var _ = require('lodash');

/* Own Modules */
var crawler = require('../crawler/originalData');
var dataFormat = require('../crawler/dataFormat');
var integrateData = require('../crawler/integrateData');
var stockInfo = require('../database/DB/stockInfo');
var cron = require('../scheme/cron');
var email = require('../notify/email');
var config = require('../config.json');
var logger = require('../logService');

/* GET home page. */
router.get('/', function (req, res, next) {
  logger.enter('Welcome to Stock Message Center!');
  res.end('Welcome to Stock Message Center!');
});

router.get('/info', function (req, res) {
  var stockArr = _.keys(config.stockCodeAndPurchasePrice);
  var stockInfoArr = [];
  async.map(stockArr,
    function (item, done) {
      integrateData.getDataOfHtmlBody(item, function (err, newStockInfo) {
        if (err) {
          logger.error(err);
          return done(err);
        }

        stockInfoArr.push(newStockInfo);
        done();
      })
    },
    function (err) {
      if (err) {
        logger.error(err);
        return res.end(err);
      }
      stockInfoArr = _.sortBy(stockInfoArr, function (item) {
        return Number(item.rateOfPurchase.split('%')[0]);
      });
      var htmlBody = dataFormat.toHtmlBody(stockInfoArr);
      res.end(htmlBody);
    });
});

router.get('/history', function (req, res) {
  logger.ndump('req.query', req.query);
  var code = req.query.code;

  crawler.getHistoryInfoByCode(code, '2017', '1', function (err, result) {
    if (err) {
      return res.end(err);
    }

    res.end(result);
  })
});

module.exports = router;
