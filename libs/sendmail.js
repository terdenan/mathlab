'use strict';

const gmail_send = require('gmail-send');
const isProduction = process.env.NODE_ENV === 'production';

function sendmail(options) {
    return new Promise((resolve, reject) => {
        if (isProduction) {
            const sender = gmail_send(options);
            sender({}, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}

module.exports = sendmail;
