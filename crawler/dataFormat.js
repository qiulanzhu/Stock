/* Third Party Modules */
var _ = require('lodash');
var moment = require('moment');
var vsprintf = require("sprintf-js").vsprintf;

/* Own Modules */
var logger = require('../logService');

var DataFormat = function () {

};

DataFormat.toEmailValueOfRealTime = function (originalData) {
  var emailValue = {};
  if (_.isNull(originalData) || _.isUndefined(originalData)) {
    return emailValue;
  }

  var stockValue = originalData.split('=')[1].split(',');
  var stockName = stockValue[0].slice(1);
  var currentPrice = stockValue[3];

  emailValue.stockName = stockName;
  emailValue.currentPrice = currentPrice;
  return emailValue;
};

DataFormat.toEmailValueOfHistory = function (originalData, tradeDay) {
  tradeDay = moment(tradeDay, 'YYYYMMDD').format('YYYY-MM-DD');
  var emailValue = {};
  if (_.isEmpty(originalData)) {
    return emailValue;
  }

  var index = _.findIndex(originalData[0], function (item) {
    return item === tradeDay;
  });

  emailValue.historyPrice = originalData[3][index];
  return emailValue;

};

DataFormat.toHtmlBody = function (emailValue) {
  var stockName = emailValue.stockName;
  var purchaseDay = emailValue.purchaseDay;
  var monthBeginTradeDay = emailValue.monthBeginTradeDay;
  var searchDay = emailValue.searchDay;
  var purchasePrice = emailValue.purchasePrice;
  var historyPrice = emailValue.historyPrice;
  var currentPrice = emailValue.currentPrice;
  var purchaseAllDays = emailValue.purchaseAllDays;
  var rateOfMonth = emailValue.rateOfMonth;
  var rateOfPurchase = emailValue.rateOfPurchase;
  
  var htmlBody =
    '<table border="1px" style="border-collapse:collapse">' +
    '  <tr> ' +
    '    <th> 股票简称 </th> ' +
    '    <th> 购买日 </th> ' +
    '    <th> 月初交易日 </th> ' +
    '    <th> 当前交易日 </th> ' +
    '    <th> 成本价格 </th> ' +
    '    <th> 月初价格 </th> ' +
    '    <th> 当前价格 </th> ' +
    '    <th> 购买天数 </th> ' +
    '    <th> 当月增长率 </th> ' +
    '    <th> 购买期增长率 </th> ' +
    '  </tr> ' +
    '  <tr align="center"> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%d</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '  </tr> ' +
    '</table> ';

  htmlBody = vsprintf(htmlBody,
    [
      stockName,
      purchaseDay,
      moment(monthBeginTradeDay, 'YYYYMMDD').format('YYYY-MM-DD'),
      moment(searchDay, 'YYYYMMDD').format('YYYY-MM-DD'),
      purchasePrice,
      historyPrice,
      currentPrice,
      purchaseAllDays,
      rateOfMonth,
      rateOfPurchase
    ]
  );

  logger.ndump('htmlBody', htmlBody);
  return htmlBody;
};

module.exports = DataFormat;