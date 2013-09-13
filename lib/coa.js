'use strict';

var PATH = require('path'),
    Q = require('q'),
    C = require('cli-color'),
    StandardRenderer = require('bower/lib/renderers').Standard;

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
    .arg()
        .name('project').title('Project path to install dependencies for (default is cwd)')
        .def(process.cwd())
        .val(function(val) {
            return PATH.resolve(process.cwd(), val);
        })
        .end()
    .completable()
    .act(function(opts, args) {
        var defer = Q.defer(),
            config = {
                verbose: false,
                cwd: args.project,
                color: true
            },
            renderer = new StandardRenderer('install', config);

        require('./install')(null, opts, config)
            .on('error', function(err) {
                renderer.error(err);
                defer.reject(err);
            })
            .on('log', function(data) {
                renderer.log(data);
            })
            .on('end', function(data) {
                renderer.end(data);
                defer.resolve();
            });

        return defer.promise;
    });
