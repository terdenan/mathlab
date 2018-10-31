module.exports = async (req, res) => {
    const newBid = {
        student: req.user.fullname,
        studentId: req.user._id,
        subject: req.body.subject,
        phone: req.user.phone,
        prefDays: req.body.prefDays,
        prefTime: req.body.prefTime,
        target: req.body.target,
        status: "pending"
    }
    await req.bidModel.create(newBid);
    const message = `Новая заявка на обучение:
                     Студент: ${newBid.student}
                     Предмет: ${newBid.subject}
                     Предпочитаемые дни: ${newBid.prefDays}
                     Предпочитаемое время: ${newBid.prefTime}
                     Цель: ${newBid.target}\n
                    `;
    await req.telegramBot._sendMessage(298493325, message);
    await req.telegramBot._sendMessage(288260717, message);
    await req.telegramBot._sendMessage(662981748, message);
    res.status(200);
    res.send('success');
}