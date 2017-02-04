/* Third Party Modules */
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');

/* Own Modules */
var config = require('../config.json');
var logger = require('../logService');

function Stock() {

}

Stock.getStockInfoByCode = function (code, callback) {
  var url = '';

  if (code.length === 8) {
    url = config.crawlerRealTimeAddress + code;
  }else if(code.length === 6){
    var prefix = code.slice(0, 1) === '6' ? 'sh' : 'sz';
    url = config.crawlerRealTimeAddress + prefix + code;
    logger.ndump('url', url);
  }else {
    return callback('code.length is invalid!');
  }

  superagent
    .get(url)
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .set('Accept-Encoding', 'gzip, deflate, sdch')
    .set('Accept-Language', 'zh-CN,zh;q=0.8')
    .set('Cache-Control', 'max-age=0')
    .set('Connection', 'keep-alive')
    .set('Host', 'hq.sinajs.cn')
    .set('Upgrade-Insecure-Requests', 1)
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36')
    .timeout(15000)
    .charset('gbk')
    .buffer(true)
    .end(function (err, res) {
      if (err) {
        logger.error(err);
        logger.debug(err.stack);
        return callback(err);
      }
      if (res.status === 200) {
        logger.ndump('res.text', res.text);
        callback(null, res.text);
      } else {
        callback('error:status=' + res.status)
      }
    });
};

Stock.getHistoryInfoByCode = function (code, year, quarter, callback) {
  var url = '';
  if (code.length === 8) {
    url = config.crawlerHistoryAddress + code.slice(2) + '/type/S.phtml';
  }else if(code.length === 6){
    url = config.crawlerHistoryAddress + code + '.phtml';
  }else {
    return callback('code.length is invalid!');
  }

  logger.ndump('url', url);

  superagent
    .get(url)
    .query('year=' + year + '&jidu=' + quarter)
    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .set('Accept-Encoding', 'gzip, deflate, sdch')
    .set('Accept-Language', 'zh-CN,zh;q=0.8')
    .set('Cache-Control', 'max-age=0')
    .set('Connection', 'keep-alive')
    .set('Host', 'money.finance.sina.com.cn')
    .set('If-Modified-Since', 'Fri, 20 Jan 2017 08:24:39 GMT')
    .set('Upgrade-Insecure-Requests', 1)
    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36')
    .timeout(30000)
    .charset()
    .buffer(true)
    .end(function (err, res) {
      if (err) {
        logger.error(err);
        logger.debug(err.stack);
        return callback(err);
      }
      var $ = cheerio.load(res.text);
      cheerioTableparser($);
      var tmp = $("#FundHoldSharesTable").parsetable(true, true, true);
      logger.ndump('tmp', tmp);

      if (res.status === 200) {
        callback(null, tmp);
      } else {
        callback('error:status=' + res.status)
      }
    });
};
module.exports = Stock;