const path = require('path');
const sitemapPath = path.join(__dirname, '..', '..', '..', 'static', 'public', 'sitemap.xml');
const sitemapper = require('libs/sitemapper');
const moment = require('moment');
const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = async (req, res) => {
    let title = cyrillicToTranslit().transform(req.body.title.toLowerCase(), '-');
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
    }
    await req.newsModel.create(newPost);
    const newsUrl = {
        loc: "https://mathlab.kz/news/" + title,
        lastmod: moment().format(),
        changefreq: "monthly",
        priority: "0.70"
    };
    await sitemapper.insertUrl(sitemapPath, newsUrl);
    res.send('success');
}