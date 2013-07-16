'use strict';

var PATH = require('path'),
    Q = require('q'),
    C = require('cli-color');

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
    .opt()
        .name('npm-development')
        .title('Pass ' + C.yellow('--development') + ' option to ' + C.blueBright('npm install') + ' (' + C.yellow('--production') + ' is passed by default)')
        .long('npm-development')
        .flag()
        .end()
    .opt()
        .name('bower-production')
        .title('Pass ' + C.yellow('--production') + ' option to ' + C.blueBright('bower install') + ' (' + C.yellow('--development') + ' is passed by default)')
        .long('bower-production')
        .flag()
        .end()
    .opt()
        .name('force')
        .title('Pass ' + C.yellow('--force') + ' option to ' + C.blueBright('bower install'))
        .long('force')
        .flag()
        .end()
    .opt()
        .name('force-latest')
        .title('Pass ' + C.yellow('--force-latest') + ' option to ' + C.blueBright('bower install'))
        .long('force-latest')
        .flag()
        .end()
    .completable()
    .act(function(opts) {
        var defer = Q.defer();

        require('./install')(null, opts)
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
