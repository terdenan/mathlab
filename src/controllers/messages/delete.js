const jade = require('jade');
const ObjectId = require('mongodb').ObjectID;


module.exports = async (req, res) => {
    const messageId = ObjectId(req.params.messageId);

    if (req.messageModel.isSender(req.user._id, messageId)) {
        await req.messageModel._remove(messageId);
        res.status(204).send('No content');
    }
    else {
        res.status(403).send('Forbidden');
    }
}