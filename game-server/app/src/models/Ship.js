var _ = require('lodash');

var Ship = function(name) {
    var me = this;

    me._name = name;
};

_.extend(Ship.prototype, {
    _name: null,
    _id: null,

    getName: function() {
        return this._name;
    },

    setId: function(id) {
        var me = this;

        me._id = id;

        return me;
    },

    getId: function() {
        return this._id;
    },

    serialize: function() {
        var me = this;

        return {
            name: me.getName(),
            id: me.getId()
        }
    }
});

module.exports = Ship;