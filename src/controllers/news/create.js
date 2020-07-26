const path = require('path');
const moment = require('moment');

const translitirate = require('../../utils/transliterate');

module.exports = async (req, res) => {
    let title = translitirate(req.body.title);

    title = title.replace(/[^a-z0-9\-]/gi, "");
    title = title.replace(/\-+/g, "-");

    const news = await req.newsModel.getBy({title: title});

    if (news) {
        res.status(400);
        res.send('This title is not available');

        return;
    }

    const newPost = {
        title: title,
        cyrillicTitle: req.body.title,
        description: req.body.description,
        body: req.body.body,
        photoUrl: "/uploads/" + req.file.filename,
        date: Date.now(),
        lastUpdatedDate: Date.now(),
    };

    await req.newsModel.create(newPost);

    res.send('success');
}
