# bower-npm-install
[![Build Status](https://secure.travis-ci.org/arikon/bower-npm-install.png?branch=master)](http://travis-ci.org/arikon/bower-npm-install)
[![NPM version](https://badge.fury.io/js/bower-npm-install.png)](http://badge.fury.io/js/bower-npm-install)
[![Dependency Status](https://david-dm.org/arikon/bower-npm-install.png)](https://david-dm.org/arikon/bower-npm-install)

Это удобный инструмент для запуска `npm install` для всех зависимостей [bower](http://bower.io).

## Быстрый старт

1. Установите модуль с помощью `npm -g install bower-npm-install`.
2. Перейдите в корень вашего проекта, где находится `bower.json`.
3. Запустите `bower-npm-install` и проверьте результат выполнения в консоли.

## Использование API

### Пример
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
