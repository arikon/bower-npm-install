'use strict';

var PATH = require('path'),
    CP = require('child_process'),
    B = require('bower'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    Emitter = require('events').EventEmitter;

module.exports = function(paths, options) {
    options = options || {};

    var emitter = new Emitter();

    B.commands.install(paths, options)
        .on('data', emitter.emit.bind(emitter, 'data'))
        .on('warn', emitter.emit.bind(emitter, 'warn'))
        .on('error', emitter.emit.bind(emitter, 'error'))
        .on('end', function() {
            B.commands.list({ paths: true })
                .on('error', emitter.emit.bind(emitter, 'error'))
                .on('data', function(packages) {
                    emitter.emit('packages', packages);

                    var cwd = process.cwd(),
                        paths = Object.keys(packages)
                            .map(function(key) {
                                return packages[key];
                            }),
                        npmBin = process.env.NPM || 'npm',
                        npmArgs = ['install', '--production'],
                        promise = Q.resolve();

                    emitter.emit('paths', paths);

                    paths.forEach(function(p) {
                        promise = promise
                            .then(function() {
                                var path = PATH.join(cwd, p);
                                return QFS.exists(PATH.join(path, 'package.json'))
                                    .then(function(isPackage) {
                                        if (!isPackage) return;

                                        var cmd = [npmBin].concat(npmArgs).join(' '),
                                            npm = CP.spawn(npmBin, npmArgs, {
                                                env: process.env,
                                                cwd: path
                                            }),
                                            defer = Q.defer();

                                        emitter.emit('data', 'Running ' + cmd + ' in ' + p + '\n');

                                        npm.stdout.on('data', emitter.emit.bind(emitter, 'data'));
                                        npm.stderr.on('data', emitter.emit.bind(emitter, 'warn'));

                                        npm.on('close', function(code) {
                                            if (code) {
                                                return defer.reject(new Error('Error (' + code + '): ' + cmd + ' in ' + p));
                                            } else {
                                                defer.resolve();
                                            }
                                        });

                                        return defer.promise;
                                    });
                            });
                    });

                    promise
                        .then(emitter.emit.bind(emitter, 'end'))
                        .fail(emitter.emit.bind(emitter, 'error'));

                });
        });

    return emitter;
};
