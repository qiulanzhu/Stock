/* Third Party Modules */
var async = require('async');
var moment = require('moment');
var _ = require('lodash');

/* Own Modules */
var crawler = require('../crawler/originalData');
var dataFormat = require('../crawler/dataFormat');
var dateAndTime = require('../toolkit/dateAndTime');
var config = require('../config.json');
var logger = require('../logService');

function IntegrateData() {

}

IntegrateData.getDataOfHtmlBody = function (code, callback) {
  var purchasePrice = config.stockCodeAndPurchasePrice[code].price;
  var purchaseDay = config.stockCodeAndPurchasePrice[code].purchaseDay;

  var checkResult = '';
  var searchDay = moment().format('YYYYMMDD');
  var tradeDay = moment().format('YYYYMM') + '01';
  var stockRealTimeValue = {};
  var stockHistoryValue = {};

  async.series({
    step0: function(done){
      dateAndTime.checkHoliday(tradeDay, function (err, result) {
        if (err) {
          done(err);
        } else {
          result = JSON.parse(result);
          logger.ndump('result', result);
          checkResult = _.values(result)[0];
          done();
        }
      })
    },
    step1: function (done) {
      async.whilst(
        function () {
          logger.debug('checkResult：' + checkResult);
          if(checkResult != '0'){
            tradeDay = moment(tradeDay, 'YYYYMMDD').add('1', 'day').format('YYYYMMDD');
            return true;
          }else {
            return false;
          }
        },
        function (over) {
          dateAndTime.checkHoliday(tradeDay, function (err, result) {
            if (err) {
              over(err);
            } else {
              result = JSON.parse(result);
              logger.ndump('result', result);
              checkResult = _.values(result)[0];
              over();
            }
          })
        },
        function (err) {
          if(err){
            logger.error(err);
            done(err);
          }else {
            done();
          }
        }
      );
    },
    step2: function (done) {
      crawler.getStockInfoByCode(code, function (err, result) {
        if (err) {
          logger.error(err);
          return done(err);
        }

        stockRealTimeValue = dataFormat.toEmailValueOfRealTime(result);
        done();
      })
    },
    step3: function (done) {
      var year = tradeDay.slice(0, 4);
      var quarter = moment(tradeDay).quarter();
      crawler.getHistoryInfoByCode(code, year, quarter, function (err, result) {
        if(err){
          logger.error(err);
          return done();
        }

        stockHistoryValue = dataFormat.toEmailValueOfHistory(result, tradeDay);
        done();
      })
    }
  }, function (err) {
    if(err){
      callback(err);
    }
    var emailValue = {
      'code': code,
      'stockName': stockRealTimeValue.stockName,
      'purchaseDay': purchaseDay,
      'monthBeginTradeDay': tradeDay,
      'searchDay': searchDay,
      'purchasePrice': Number(purchasePrice),
      'historyPrice': _.isNaN(Number(stockHistoryValue.historyPrice)) === true ? 0 : Number(stockHistoryValue.historyPrice),
      'currentPrice': Number(stockRealTimeValue.currentPrice),
      'purchaseAllDays': moment(searchDay).diff(purchaseDay, 'day')
    };

    if( emailValue.historyPrice === 0 ){
      emailValue.rateOfMonth = '%'
    }else{
      emailValue.rateOfMonth = (((emailValue.currentPrice - emailValue.historyPrice) / emailValue.historyPrice ) * 100)
          .toFixed(2) + '%';
    }

    emailValue.rateOfPurchase = (((emailValue.currentPrice - emailValue.purchasePrice) / emailValue.purchasePrice) * 100)
        .toFixed(2) + '%';

    logger.ndump('emailValue', emailValue);

    callback(null, emailValue);
  })
};


module.exports = IntegrateData;