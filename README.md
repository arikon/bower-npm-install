# bower-npm-install
[![Build Status](https://secure.travis-ci.org/arikon/bower-npm-install.png?branch=master)](http://travis-ci.org/arikon/bower-npm-install)
[![NPM version](https://badge.fury.io/js/bower-npm-install.png)](http://badge.fury.io/js/bower-npm-install)
[![Dependency Status](https://david-dm.org/arikon/bower-npm-install.png)](https://david-dm.org/arikon/bower-npm-install)

It is a convenient tool to run `npm install` on every [bower](http://bower.io) dependency.

## Quickstart

1. Install it `npm -g install bower-npm-install`
2. `cd` to your project root with `bower.json`
3. Run `bower-npm-install` and see the output

## API usage

### Example
```js
var bowerNpmInstall = require('bower-npm-install');

bowerNpmInstall(/*paths, options, config*/)
    .on('log', function(data) {
        console.log(data);
    })
    .on('error', function(err) {
        console.error(err);
    })
    .on('end', function(installed) {
        console.log('Installed packages: ' + JSON.stringify(installed, null, 2));
    });
```
