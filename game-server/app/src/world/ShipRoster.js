var _ = require('lodash'),
    pomelo = require('pomelo'),
    models = require('../models');

var INDEX = 0;
function newIndex() {
    return INDEX++;
}

var ShipRoster = function() {
    var me = this;
    me._ships = {};
    me._players = {};
};

_.extend(ShipRoster.prototype, {
    _ships: null,
    _players: null,

    getAllShips: function() {
        return _.values(this._ships);
    },

    addShip: function(ship) {
        var me = this,
            index = newIndex();

        ship.setId(index);
        me._ships[index] = ship;

        var channel = me.getChannel();
        channel.pushMessage('ShipAdded', ship.serialize());

        return ship;
    },

    addPlayer: function(player)
    {
        var me = this;
        me._players[player.getId()] = player;

        var channel = me.getChannel();
        channel.add(player.getId(), player.getServerId());

        channel.pushMessage('PlayerAdded', player.serialize());

        return true;
    },

    removePlayer: function(playerId)
    {
        var me = this;
        var player = me._players[playerId];

        var channel = me.getChannel();
        channel.leave(player.getId(), player.getServerId());
        channel.pushMessage('PlayerLeft', player.serialize());

        delete me._players[playerId];
    },

    getChannel: function() {
        return pomelo.app.get('channelService').getChannel('lobby', true)
    }

});

module.exports = ShipRoster;