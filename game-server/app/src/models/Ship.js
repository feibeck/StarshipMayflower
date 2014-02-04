var _ = require('lodash');

var Ship = function(name) {
    var me = this;

    me._name = name;
    me._creator = null;
};

_.extend(Ship.prototype, {
    _name: null,
    _id: null,
    _creator: null,

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

    setCreator: function(player) {
        var me = this;
        me._creator = player;
        return me;
    },

    getCreator: function() {
        return this._creator;
    },

    serialize: function() {
        var me = this;

        var creator;
        if (me._creator) {
            creator = me._creator.serialize();
        }

        return {
            name: me.getName(),
            id: me.getId(),
            creator: creator
        }
    }
});

module.exports = Ship;