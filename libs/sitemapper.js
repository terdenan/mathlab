const fs = require('fs');
const xml2js = require('xml2js');
const builder = new xml2js.Builder();
const parser = xml2js.Parser();

module.exports = {
    readFile: function (filepath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    },
    writeFile: function(filepath, file) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filepath, file, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    },
    parse: function(data) {
        return new Promise((resolve, reject) => {
            parser.parseString(data, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    },
    insertUrl: async function(filepath, data) {
        const sitemap = await this.readFile(filepath);
        const parsedSitemap = await this.parse(sitemap);
        parsedSitemap.urlset.url.push(data);
        const updatedSitemap = builder.buildObject(parsedSitemap);
        await this.writeFile(filepath, updatedSitemap);
    }
}