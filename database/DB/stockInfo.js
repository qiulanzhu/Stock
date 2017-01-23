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
    table.float('purchasePrice',9,3);
    table.float('historyPrice',9,3);
    table.float('currentPrice',9,3);
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

StockInfo.get = function (code, callback) {
  checkExist(code, function (err) {
    if(err){
      logger.error(err);
      return callback(err);
    }

    var sql = knex.select('code','stockName','purchaseDay','monthBeginTradeDay',
      'searchDay','purchasePrice','historyPrice','currentPrice','purchaseAllDays',
      'rateOfMonth','rateOfPurchase')
      .from(code)
      .orderBy('searchDay', 'asc')
      .toString();

    logger.sql(sql);
    mysql.query(sql, callback);
  });
};

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