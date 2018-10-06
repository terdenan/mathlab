module.exports = async (req, res) => {

    const body = req.body;
    const isDataValid = body
            && Object.prototype.hasOwnProperty.call(body, 'name')
            && typeof(body.name) === 'string'
            && Object.prototype.hasOwnProperty.call(body, 'phone')
            && typeof(body.phone) === 'string';

    if (!isDataValid) {
        res.status(400);
        res.send('Callback request data is invalid');
        return;
    }

    const name = req.body.name;
    const phone_number = req.body.phone;
    const preferred_teacher = req.body.teacher || 'не указан';
    const newCallback = {
        name: name,
        phone_number: phone_number,
        preferred_teacher: preferred_teacher
    };
    await req.callbackModel.create(newCallback);
    const message = `Заказ на обратный звонок:
                     Имя: ${newCallback.name}
                     Телефон: ${newCallback.phone_number}
                     Преподаватель: ${newCallback.preferred_teacher}
                    `;
    await req.telegramBot._sendMessage(298493325, message);
    await req.telegramBot._sendMessage(288260717, message);
    await req.telegramBot._sendMessage(662981748, message);
    res.send(newCallback);
}