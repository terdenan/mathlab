const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    const bidId = ObjectId(req.body.id);
    const fields = req.body.fields;
    await req.bidModel.update({_id: bidId}, fields);
    res.status(200);
    res.send('success');
}