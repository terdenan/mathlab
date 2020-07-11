const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = function(str) {
	let transliteratedStr = cyrillicToTranslit().transform(str.toLowerCase(), '-');

	transliteratedStr = transliteratedStr.replace(/[^a-z0-9\-]/gi, "");
	transliteratedStr = transliteratedStr.replace(/\-+/g, "-");

	return transliteratedStr;
}