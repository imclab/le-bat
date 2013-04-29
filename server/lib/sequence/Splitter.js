var _ = require('underscore')
	, XRegExp = require('xregexp').XRegExp;

module.exports = Splitter;

/**
 * Used to split a text into sequences of characters. The base-delimiter is a space. 
 * Refer to Splitter.patterns if you want to ignore certain parts in the output.
 * Example: `new Splitter({ ignore: 'usernames', 'punctuation' })` will ignore all
 * punctuation and sequences beginning with `@`. Always put `punctuation` at the end!
 */
function Splitter(options) {
	this.ignore = _.intersection(options.ignore, _.keys(Splitter.patterns));
	this.ignorePattern = this.ignore.length == 0 ? /[]/ig : XRegExp(
		_.map(this.ignore, function(element) { return Splitter.patterns[element] }).join('|'), 'ig'
	);
};

Splitter.patterns = {
	punctuation: '([\\p{Sm}\\p{Sk}\\p{So}\\p{C}\\p{Mc}\\p{P}])'
	, usernames: '(\\@\\w+)'
	, hashtags: '(\\#\\w+)'
};


Splitter.prototype.split = function(text) {
	return text.replace(this.ignorePattern, " ").replace(/\s+/ig, " ").trim().split(" ");
};
