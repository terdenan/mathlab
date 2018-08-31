const bcrypt = require('bcrypt');
const ApplicationError = require('libs/application-error');
const mongoose = require('mongoose');
const md5 = require('md5');

module.exports = async (req, res) => {
    const user = await req.userModel.getBy({email: req.body.email});
    if (user) {
        res.status(400);
        res.send('This email is not available');
    }
    const hash = await bcrypt.hash(req.body.password, 10);
    const confirmationCode = md5(Date.now());
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
        lastEmailDate: Date.now(),

    };
    const savedUser = await req.userModel.create(newUser);
    res.status(200);
    res.send(savedUser);
}