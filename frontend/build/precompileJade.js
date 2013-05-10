var jade = require('jade')
,   fs = require('fs')
,   path = require('path')
,    _ = require('underscore')

if(process.argv.length < 4) {
    console.log('Provide source Jade file path and target JS path')
    process.exit()
}

var source = process.argv[2];
var target = process.argv[3];

console.log('compiling', source);

var code = jade.compile(fs.readFileSync(source, {encoding: 'utf8'}), {
    debug: false,
    compileDebug: false,
    filename: source,
    client: true
});

fs.writeFile(target, 'define([], function(){ return function ' + code.toString().substring(18) + ' });');
