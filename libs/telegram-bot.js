const config = require('config');
const isProduction = process.env.NODE_ENV === 'production';
const TelegramBot = require('node-telegram-bot-api');
const bot = isProduction ? new TelegramBot(config.telegram.token, {polling: true}) : {};

bot._sendMessage = (chatId, resp) => {
    return new Promise((resolve, reject) => {
        if (isProduction) {
            bot.sendMessage(chatId, resp).catch((error) => {
                reject(error)
            });
        }
        resolve();
    });
}

module.exports = bot;