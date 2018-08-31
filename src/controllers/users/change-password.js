const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const match = await bcrypt.compare(oldPassword, req.user.password);
    if (!match) {
        res.status(400);
        res.send('Incorrect password');
        return;
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await req.userModel.update(req.user._id, {password: hash});
    res.send('success');
}