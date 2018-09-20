const ObjectId = require('mongodb').ObjectID;

const DEFAULT_COUNT = 10;
const DEFAULT_LAST_ID = '000000000000000000000000';

module.exports = async (req, res) => {
    const last_id = req.query.lastID || DEFAULT_LAST_ID;
    const count = parseInt(req.query.count) || DEFAULT_COUNT;

    const bids = await req.bidModel.getMany(
        {_id: {$lt: ObjectId(last_id)}},
        {date: -1},
        count
    );
    res.send(bids);
}