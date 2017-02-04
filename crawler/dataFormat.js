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
  logger.enter(emailValue);

  var row =
    '  <tr align="center"> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%f</td> ' +
    '    <td>%d</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '    <td>%s</td> ' +
    '  </tr> ';
  var rows = '';

  var stockName = '';
  var purchaseDay = '';
  var monthBeginTradeDay = '';
  var searchDay = '';
  var purchasePrice = 0;
  var historyPrice = 0;
  var currentPrice = 0;
  var indexHistoryPrice = 0;
  var indexCurrentPrice = 0;
  var purchaseAllDays = 0;
  var rateOfIndex = '';
  var rateOfMonth = '';
  var rateOfPurchase = '';

  _.forEach(emailValue, function (item) {
    logger.ndump('item', item);
    
    stockName = item.stockName;
    purchaseDay = item.purchaseDay;
    monthBeginTradeDay = item.monthBeginTradeDay;
    searchDay = item.searchDay;
    purchasePrice = item.purchasePrice;
    historyPrice = item.historyPrice;
    currentPrice = item.currentPrice;
    indexHistoryPrice = item.indexHistoryPrice;
    indexCurrentPrice = item.indexCurrentPrice;
    purchaseAllDays = item.purchaseAllDays;
    rateOfIndex = item.rateOfIndex;
    rateOfMonth = item.rateOfMonth;
    rateOfPurchase = item.rateOfPurchase;

    rows += vsprintf(row,
      [
        stockName,
        purchaseDay,
        moment(monthBeginTradeDay, 'YYYYMMDD').format('YYYY-MM-DD'),
        moment(searchDay, 'YYYYMMDD').format('YYYY-MM-DD'),
        purchasePrice,
        historyPrice,
        currentPrice,
        indexHistoryPrice,
        indexCurrentPrice,
        purchaseAllDays,
        rateOfIndex,
        rateOfMonth,
        rateOfPurchase
      ]
    );

    logger.debug('rows', rows);
  });

  
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
    '    <th> 购买日指数 </th> ' +
    '    <th> 当前指数 </th> ' +
    '    <th> 购买天数 </th> ' +
    '    <th> 指数增长率 </th> ' +
    '    <th> 当月增长率 </th> ' +
    '    <th> 购买期增长率 </th> ' +
    '  </tr> ' +
    rows +
    '</table> ';

  logger.ndump('htmlBody', htmlBody);
  return htmlBody;
};

module.exports = DataFormat;