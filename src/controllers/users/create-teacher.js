const bcrypt = require('bcrypt');
const ApplicationError = require('libs/application-error');
const mongoose = require('mongoose');
const md5 = require('md5');

module.exports = async (req, res) => {
    const isDataValid = req.body
            && Object.prototype.hasOwnProperty.call(req.body, 'fullname')
            && typeof(req.body.fullname) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'email')
            && typeof(req.body.email) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'password')
            && typeof(req.body.password) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'subject')
            && typeof(req.body.subject) === 'string'
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

    const hash = await bcrypt.hash(req.body.password, 10);
    const currentDate = Date.now();
    const confirmationCode = md5(currentDate);
    const newUser = {
        _id: new mongoose.Types.ObjectId,
        fullname: req.body.fullname,
        email: req.body.email,
        password: hash,
        phone: req.body.phone,
        sex: parseInt(req.body.sex),
        subject: req.body.subject,
        confirmed: true,
        priority: 1,
        lastEmailDate: currentDate,
        registrationDate: currentDate,
    };
    const savedUser = await req.userModel.create(newUser);

    await req.teacherInfo.create({_teacher_id: newUser._id});

    res.status(200);
    res.send(savedUser);
}
