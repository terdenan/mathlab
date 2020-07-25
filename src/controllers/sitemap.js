const fs = require('fs');
const path = require('path');
const util = require('util');
const moment = require('moment');
const xml2js = require('xml2js');

const readFile = util.promisify(fs.readFile);
const builder = new xml2js.Builder();

const NEWS_PATH = 'https://mathlab.kz/news';
const TEACHER_INFO_PATH = 'https://mathlab.kz/teacher';
const SITEMAP_FIELDS_BY_ENTRY_TYPE = {
    news: {
        changefreq: 'monthly',
        priority: '0.70',
    },
    teacherInfo: {
        changefreq: 'monthly',
        priority: '0.70',
    },
}

const exportNewsForSitemap = (news) => {
    return news.map(entry => {
        // lastUpdatedDate может не быть
        const lastmodDate = entry.lastUpdatedDate || entry.date;

        return {
            loc: `${NEWS_PATH}/${entry.title}`,
            lastmod: moment(lastmodDate).format(),
            ...SITEMAP_FIELDS_BY_ENTRY_TYPE['news'],
        };
    });
}

const exportTeacherInfosForSitemap = (teacherInfos) => {
    return teacherInfos.map(teacherInfo => {
        // lastUpdatedDate может не быть
        const lastmodDate = teacherInfo.lastUpdatedDate || new Date();

        return {
            loc: `${TEACHER_INFO_PATH}/${teacherInfo.transliterated_fullname}`,
            lastmod: moment(lastmodDate).format(),
            ...SITEMAP_FIELDS_BY_ENTRY_TYPE['teacherInfo'],
        };
    });
};

async function getSitemap(req, res) {
    const sitemapPath = path.resolve(__dirname, '..', '..', 'static', 'sitemap.xml');
    const sitemapContent =  await readFile(sitemapPath, 'utf-8');
    const sitemapObject = await xml2js.parseStringPromise(sitemapContent);

    const news = await req.newsModel.getAll();
    const teacherInfos = await req.teacherInfo.getAll();

    const sitemapNewsEntries = exportNewsForSitemap(news);
    const sitemapTeacherInfoEntries = exportTeacherInfosForSitemap(teacherInfos);

    sitemapObject.urlset.url.push(...sitemapNewsEntries);
    sitemapObject.urlset.url.push(...sitemapTeacherInfoEntries);

    const updatedSitemap = builder.buildObject(sitemapObject);

    res.header('Content-Type', 'application/xml');
    res.send(updatedSitemap);
}

module.exports = {
    getSitemap,
};
