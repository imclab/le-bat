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
	// Not used right now, see #split
	/* this.ignorePattern = this.ignore.length == 0 ? /[]/ig : XRegExp(
		_.map(this.ignore, function(element) { return Splitter.patterns[element] }).join('|'), 'ig'
	); */
};

Splitter.patterns = {
	usernames: '(\\@\\w+)'
	, hashtags: '(\\#\\w+)'
	, urls: '((?:(?:https?|ftp|file)://|www\.|ftp\.)[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#/%=~_|$])'
	, punctuation: '([\\p{Sm}\\p{Sk}\\p{So}\\p{C}\\p{Mc}\\p{P}])'
	, single_letters: '((\\s|^)[\\p{L}](?=\\s|$))'
};


Splitter.prototype.split = function(text) {
	this.ignore.forEach(function(element) {
		text = text.replace(XRegExp(Splitter.patterns[element], 'ig'), ' ');
	})
	var result = text.replace(/\s+/ig, " ").trim().split(" ");
	if(result.length)
		for(var i=result.length; i>=0; --i) {
			if(!result[i] || !result[i].trim()) result.splice(i,1);
		}
	return result;
	// Doing all in one pattern via OR groups doesn't match single letters
	// Needs revision:
	// return text.replace(this.ignorePattern, " ").replace(/\s+/ig, " ").trim().split(" ");
};
