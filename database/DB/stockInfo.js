/* Third Party Modules */
var knex = require('knex')({
  client: 'mysql'
});

/* Own Modules */
var mysql = require('../mysql');
var logger = require('../../logService');

function checkExist(code, callback) {
  var sql = knex.schema.createTableIfNotExists(code, function (table) {
    table.string('code');
    table.string('stockName');
    table.string('purchaseDay');
    table.string('monthBeginTradeDay');
    table.string('searchDay');
    table.float('purchasePrice');
    table.float('historyPrice');
    table.float('currentPrice');
    table.integer('purchaseAllDays');
    table.string('rateOfMonth');
    table.string('rateOfPurchase');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.charset('utf8');
  }).toString();

  logger.sql(sql);
  mysql.query(sql, callback);
}

function StockInfo() {
  
}

StockInfo.save = function (stockInfo, callback) {
  checkExist(stockInfo.code, function (err) {
    if(err){
      logger.error(err);
      return callback(err);
    }

    var sql = knex(stockInfo.code).insert(stockInfo).toString();
    
    logger.sql(sql);
    mysql.query(sql, callback);
  })
};



module.exports = StockInfo;