var _ = require('lodash'),
    pomelo = require('pomelo'),
    models = require('../models');

var INDEX = 1;
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

    getShip: function(shipId)
    {
        var me = this;
        var ship = me._ships[shipId];
        return ship;
    },

    addShip: function(ship, player) {
        var me = this,
            index = newIndex();

        ship.setId(index);
        ship.setCreator(player);

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

    getPlayer: function(playerId)
    {
        var me = this;
        var player = me._players[playerId];
        return player;
    },

    removePlayer: function(playerId)
    {
        var me = this;
        var player = me._players[playerId];

        var ship = player.getShip();
        if (ship) {
            player.setShip(null);
            ship.removePlayer(player);

            var shipChannel = me.getShipChannel(ship);
            shipChannel.pushMessage('StationReleased', ship.serialize());
        }

        var channel = me.getChannel();
        channel.leave(player.getId(), player.getServerId());
        channel.pushMessage('PlayerLeft', player.serialize());

        delete me._players[playerId];
    },

    addPlayerToShip: function(ship, player)
    {
        ship.addPlayer(player);
        player.setShip(ship);

        var channel = this.getShipChannel(ship);
        channel.add(player.getId(), player.getServerId());

        channel.pushMessage('PlayerAddedToShip', player.serialize());
    },

    takeStation: function(ship, player, position)
    {
        var success = ship.takeStation(position, player);
        if (success) {
            var channel = this.getShipChannel(ship);
            channel.pushMessage('StationTaken', ship.serialize());
        }
        return success;
    },

    releaseStation: function(ship, player, position)
    {
        var success = ship.releaseStation(position, player);
        if (success) {
            var channel = this.getShipChannel(ship);
            channel.pushMessage('StationReleased', ship.serialize());
        }
        return success;
    },

    getShipChannel: function(ship)
    {
        return pomelo.app.get('channelService').getChannel('ship-' + ship.getId(), true)
    },

    getChannel: function() {
        return pomelo.app.get('channelService').getChannel('lobby', true)
    }

});

module.exports = ShipRoster;