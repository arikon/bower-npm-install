var PATH = require('path'),
    Q = require('q');

module.exports = require('coa').Cmd()
    .name(PATH.basename(process.argv[1]))
    .title('App description.')
    .helpful()
    .opt()
        .name('version').title('Show version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() {
            var p = require('../package.json');
            return p.name + ' ' + p.version;
        })
        .end()
    .completable()
    .act(function() {
        return Q.resolve('It works!');
    });
