var _ = require('lodash');

var Player = function(id, name, serverId) {
    var me = this;
    me._id = id;
    me._name = name;
    me._serverId = serverId;
};

_.extend(Player.prototype, {
    _id: null,
    _name: null,
    _serverId: null,

    getId: function() {
        return this._id;
    },

    getName: function() {
        return this._name;
    },

    getServerId: function() {
        return this._serverId;
    },

    serialize: function() {
        var me = this;

        return {
            id: me.getId(),
            name: me.getName()
        }
    }
});

module.exports = Player;