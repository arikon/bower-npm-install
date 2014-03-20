'use strict';

var PATH = require('path'),
    CP = require('child_process'),
    B = require('bower'),
    Q = require('q'),
    L = require('lodash'),
    QFS = require('q-io/fs'),
    Logger = require('bower/node_modules/bower-logger'),
    byline = require('byline'),
    inquirer =  require('inquirer');

module.exports = function(paths, options, config) {
    options = L.extend({}, options || {});
    options.production = !!options['bower-production'];

    var logger = new Logger(),
        emitError = logger.emit.bind(logger, 'error'),
        emitEnd = logger.emit.bind(logger, 'end');

    config = L.extend({ logger: logger }, config);

    bowerInstall(paths, options, config)
        .then(function(installed) {
            // force npm to install dependencies in all bower packages
            if (options.force) {
                return bowerList({ offline: true }, config)
                    .then(function(list) {
                        // FIXME: check for nested dependencies
                        return npmInstallAll(list.dependencies || {}, options, config);
                    });
            }
            // install dependencies in updated packages only
            return npmInstallAll(installed, options, config);
        })
        .then(emitEnd, emitError);

    return logger;
};

function bowerInstall(paths, options, config) {
    var d = Q.defer(),
        logger = config.logger || new Logger();

    B.commands.install(paths, options, config)
        .on('log', function(data) {
            logger.emit('log', data);
        })
        .on('error', function(err) {
            logger.emit('error', err);
            d.reject(err);
        })
        .on('end', function(installed) {
            d.resolve(installed);
        })
        .on('prompt', function (prompts, callback) {
             inquirer.prompt(prompts, callback);
        });

    return d.promise;
}

function bowerList(options, config) {
    var d = Q.defer(),
        logger = config.logger || new Logger();

    B.commands.list(options, config)
        .on('log', function(data) {
            logger.emit('log', data);
        })
        .on('error', function(err) {
            logger.emit('error', err);
            d.reject(err);
        })
        .on('end', function(list) {
            d.resolve(list);
        });

    return d.promise;
}

function npmInstallAll(list, options, config) {
    var logger = config.logger || new Logger(),

        npmBin = process.env.NPM || (process.platform === 'win32' ? 'npm.cmd' : 'npm'),
        npmArgs = ['install', options['npm-development'] ? '--development' : '--production'],
        promise = Q.resolve();

    Object.keys(list)
        .map(function(key) {
            return {
                name: list[key].pkgMeta.name,
                version: list[key].pkgMeta.version,
                path: list[key].canonicalDir
            };
        })
        .forEach(function(dep) {
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
                                    defer.resolve(list);
                                }
                            });

                            return defer.promise;
                        });
                });
        });

    return promise;
}
