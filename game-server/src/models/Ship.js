var _ = require('lodash');

var Ship = function(name) {
    var me = this;

    me._name = name;
};

_.extend(Ship.prototype, {
    _name: null,

    getName: function() {
        return this._name;
    }
});

module.exports = Ship;