const async = require('async');
const User = require('../db/models/user');

module.exports = function (bot) {
	bot.onText(/\/users/, (msg) => {
	  const chatId = msg.chat.id;
	  async.waterfall([
	  	function(callback){
	  		User.find({}, 'fullname', function(err, data){
					var arr = data, length = arr.length, responseMessage = "";
					arr.forEach(function(item, i, arr){
						responseMessage += (i + 1) + ") " + item.fullname + "\n";
						if (i == length - 1) callback(null, responseMessage)
					});
				});
	  	}
	  	], 
	  	function(err, responseMessage){
	  		bot.sendMessage(chatId, responseMessage);
	  });
	});
}