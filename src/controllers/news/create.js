const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();
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
    const sitemap = await sitemapper.readFile(sitemapPath);
    const obj = {
        loc: "https://mathlab.kz/news/" + title,
        lastmod: moment().format(),
        changefreq: "monthly",
        priority: "0.70"
    };
    const parsedSitemap = await sitemapper.parse(sitemap);
    parsedSitemap.urlset.url.push(obj);
    const updatedSitemap = builder.buildObject(parsedSitemap);
    await sitemapper.writeFile(sitemapPath, updatedSitemap);
    res.send('success');
}