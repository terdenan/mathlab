const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const isProduction = process.env.NODE_ENV === 'production';
const bot = isProduction ? new TelegramBot(config.telegram.token, { polling: true }) : {};

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
