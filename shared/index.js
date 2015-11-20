/* global node: true */

module.exports = {
    model: require('./model'),
    sylvester: require('sylvester'),
    EventEmitter: require('events').EventEmitter,
    util: require('util')
};