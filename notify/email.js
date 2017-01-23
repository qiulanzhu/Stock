/* Third Party Modules */
var nodeMailer = require('nodemailer');
var moment = require('moment');

/* Own Modules */
var config = require('../config.json');
var logger = require('../logService');

exports.sendEmail = function (body) {
//邮箱配置
  var smtpConfig = config.smtpConfig;

//内容配置
  var mailOptions = {
    from: '"发送者姓名" <jin_yaoshi@163.com>', // sender address
    to: 'qy_stone@126.com', // list of receivers
    subject: moment().format('MM') + '股票数据', // Subject line
    text: '大盘增长率：;该股增长率：', // plaintext body
    html: body // html body
  };

// 邮件发送
  var transporter = nodeMailer.createTransport(smtpConfig);
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return logger.error(err);
    }

    logger.debug('Message sent: ' + info.response);
  });
};
