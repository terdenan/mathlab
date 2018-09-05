module.exports = async (req, res) => {
    const name = req.body.name;
    const phone_number = req.body.phone;
    const newCallback = {
        name: name,
        phone_number: phone_number,
    };
    await req.callbackModel.create(newCallback);
    const message = `Заказ на обратный звонок:
                     Имя: ${newCallback.name}
                     Телефон: ${newCallback.phone_number}
                    `;
    await req.telegramBot._sendMessage(298493325, message);
    await req.telegramBot._sendMessage(288260717, message);
    await req.telegramBot._sendMessage(662981748, message);
    res.send(newCallback);
}