const bcrypt = require('bcrypt');
const md5 = require('md5');
const ApplicationError = require('libs/application-error');
const sendmail = require('libs/sendmail');
const mongoose = require('mongoose');
const jade = require('jade');
const config = require('config');

module.exports = async (req, res) => {

    const isDataValid = req.body
            && Object.prototype.hasOwnProperty.call(req.body, 'fullname')
            && typeof(req.body.fullname) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'email')
            && typeof(req.body.email) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'password')
            && typeof(req.body.password) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'phone')
            && typeof(req.body.phone) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'sex')
            && typeof(parseInt(req.body.sex)) === 'number';

    if (!isDataValid) {
        res.status(400);
        res.send('User data is invalid');
        return;
    }

    const user = await req.userModel.getBy({email: req.body.email});

    if (user) {
        res.status(400);
        res.send('This email is not available');
        return;
    }

    const currentDate = Date.now();
    const hash = await bcrypt.hash(req.body.password, 10);
    const confirmationCode = md5(currentDate);
    const newUser = {
        _id: new mongoose.Types.ObjectId,
        fullname: req.body.fullname,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        sex: parseInt(req.body.sex),
        grade: req.body.grade,
        confirmed: false,
        priority: 0,
        emailConfirmCode: confirmationCode,
        emailConfirmDuration: currentDate + 24 * 60 * 60 * 1000,
        lastEmailDate: currentDate,
        registrationDate: currentDate,
    };
    const savedUser = await req.userModel.create(newUser);
    const context = { 
        code: confirmationCode,
        email: newUser.email,
        fullname: newUser.fullname
    };
    // Узкое место
    const emailBody = jade.renderFile('src/views/main/mail-bodies/email-confirm.jade', context);
    const emailOptions = {
        user: config.gmail.login,
        pass: config.gmail.password,
        to:   newUser.email,
        subject: 'Подтверждение адреса электронной почты',
        html:   emailBody,
    };
    await sendmail(emailOptions);
    const message = `Новый ученик:
                     Имя: ${newUser.fullname}
                     Почта: ${newUser.email}
                     Телефон: ${newUser.phone}
                    `;
    await req.telegramBot._sendMessage(298493325, message);
    await req.telegramBot._sendMessage(288260717, message);
    await req.telegramBot._sendMessage(662981748, message);
    req.login(savedUser, (err) => {
        if (err) {
            throw new ApplicationError(err, 500);
        }
        res.status(200);
        res.send(req.user);
    });
}
