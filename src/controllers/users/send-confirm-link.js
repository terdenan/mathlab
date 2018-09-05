const bcrypt = require('bcrypt');
const md5 = require('md5');
const sendmail = require('libs/sendmail');
const jade = require('jade');
const moment = require('moment');
const config = require('config');

module.exports = async (req, res) => {
    const code = md5(Date.now());
    const user = await req.userModel.getBy({_id: req.user._id, confirmed: false});
    if (!user) {
        res.status(400);
        res.send();
        return;
    }
    const now = moment(Date.now()).format();
    const send_again_date = moment(user.lastEmailDate).add(15, 'm').format();
    if (now < send_again_date) {
        res.status(403);
        res.send();
        return;
    }
    await req.userModel.update(user._id, {
        emailConfirmCode: code,
        emailConfirmDuration: Date.now() + 24 * 60 * 60 * 1000,
        lastEmailDate: Date.now(),
    });
    const emailBody = jade.renderFile('src/views/main/mail-bodies/email-confirm.jade', 
        {
            code: code,
            email: user.email,
            fullname: user.fullname    
        }
    );
    const emailOptions = {
        user: config.gmail.login,
        pass: config.gmail.password,
        to:   newUser.email,
        subject: 'Подтверждение адреса электронной почты',
        html:   emailBody,
    };
    await sendmail(emailOptions);
    res.send('success');
}