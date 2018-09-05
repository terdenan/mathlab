const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = async (req, res) => {
    const code = req.body.code;
    const user = await req.userModel.getBy({changePasswordCode: code});
    if (!user) {
        res.status(400);
        res.send();
        return;
    }
    const now = moment(Date.now()).format();
    const code_valid_date = moment(user.changePasswordDuration).format();
    if (now > code_valid_date) {
        res.status(400);
        res.send();
        return;
    }
    const newPassword = req.body.newPassword;
    const hash = await bcrypt.hash(newPassword, 10);
    await req.userModel.update(user._id, {password: hash});
    res.send('success');
}