/* Third Party Modules */

/* Own Modules */
var logger = require('../logService');
var config = require('../config.json');
var mysql = require('mysql').createPool(config.mysql);


module.exports = mysql;
