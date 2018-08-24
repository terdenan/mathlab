const async = require('async');
const User = require('../db/models/user');

module.exports = function (bot) {
	bot.onText(/\/getchatid/, (msg) => {
	  const chatId = msg.chat.id;
	  var responseMessage = 'Your chatId is ' + chatId
	  bot.sendMessage(chatId, responseMessage);
	});
}