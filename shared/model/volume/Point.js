/* jshint node:true */

var _ = require('lodash');

function Point() {}

_.extend(Point, {
    type: 'POINT'
});

_.extend(Point.prototype, {
    type: Point.type
});

module.exports = Point;