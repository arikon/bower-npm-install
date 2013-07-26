'use strict';

var PATH = require('path'),
    CP = require('child_process'),
    B = require('bower'),
    Q = require('q'),
    L = require('lodash'),
    QFS = require('q-io/fs'),
    Logger = require('bower/node_modules/bower-logger'),
    byline = require('byline');

module.exports = function(paths, options, config) {
    options = L.extend({}, options || {});
    options.production = !!options['bower-production'];

    var logger = new Logger(),
        emitLog = logger.emit.bind(logger, 'log'),
        emitError = logger.emit.bind(logger, 'error');

    B.commands.install(paths, options, config)
        .on('log', emitLog)
        .on('error', emitError)
        .on('end', function(installed) {
            B.commands.list({ offline: true }, config)
                .on('error', emitError)
                .on('log', emitLog)
                .on('end', function(list) {

                    var deps = list.dependencies,
                        paths = Object.keys(deps)
                            .map(function(key) {
                                return {
                                    name: deps[key].pkgMeta.name,
                                    version: deps[key].pkgMeta.version,
                                    path: deps[key].canonicalDir
                                };
                            }),
                        npmBin = process.env.NPM || 'npm',
                        npmArgs = ['install', options['npm-development'] ? '--development' : '--production'],
                        promise = Q.resolve();

                    paths.forEach(function(dep) {
                        var path = dep.path;
                        promise = promise
                            .then(function() {
                                return QFS.exists(PATH.join(path, 'package.json'))
                                    .then(function(isPackage) {
                                        if (!isPackage) return;

                                        var p = PATH.relative(config.cwd, path),
                                            cmd = [npmBin].concat(npmArgs).join(' '),
                                            npm = CP.spawn(npmBin, npmArgs, {
                                                env: process.env,
                                                cwd: path
                                            }),
                                            defer = Q.defer(),

                                            npmStdout = new byline.LineStream(),
                                            npmStderr = new byline.LineStream();

                                        npm.stdout.pipe(npmStdout);
                                        npm.stderr.pipe(npmStderr);

                                        logger.info('npm install', cmd + ' in ' + p, dep);

                                        // forward output
                                        npmStdout.on('data', function(data) {
                                            logger.info('npm install', data, dep);
                                        });

                                        // forward warnings
                                        npmStderr.on('data', function(data) {
                                            logger.warn('npm install', data, dep);
                                        });

                                        npm.on('close', function(code) {
                                            if (code) {
                                                return defer.reject(new Error('Error (' + code + '): ' + cmd + ' in ' + p));
                                            } else {
                                                defer.resolve(installed);
                                            }
                                        });

                                        return defer.promise;
                                    });
                            });
                    });

                    promise
                        .then(logger.emit.bind(logger, 'end'))
                        .fail(logger.emit.bind(logger, 'error'));

                });
        });

    return logger;
};
