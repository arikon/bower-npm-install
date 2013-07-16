'use strict';

var PATH = require('path'),
    Q = require('q');

module.exports = require('coa').Cmd()
    .name(PATH.basename(process.argv[1]))
    .title('Install bower dependencies and npm dependencies for installed bower packages.')
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
        var defer = Q.defer();

        require('./install')()
            .on('error', defer.reject.bind(defer))
            .on('data', function(data) {
                process.stdout.write(data);
            })
            .on('warn', function(data) {
                process.stderr.write(data);
            })
            .on('paths', function(paths) {
                console.log(JSON.stringify(paths, null, 4));
            })
            .on('end', defer.resolve.bind(defer));

        return defer.promise;
    });
