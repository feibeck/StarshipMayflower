var _ = require('lodash'),
    pomelo = require('pomelo');

/**
 * Manages pomelo channels to the clients
 *
 * @constructor
 */
var Channel = function() {
    var me = this;
};

_.extend(Channel.prototype, {

    /**
     * Pushes a message to a ship
     *
     * @param {Ship}   ship
     * @param {String} route
     * @param {Object} msg
     */
    pushToShip: function(ship, route, msg)
    {
        var channel = this.getShipChannel(ship);
        if (channel) {
            channel.pushMessage(route, msg);
        }
    },

    /**
     * Pushes a message to the lobby
     *
     * @param {String} route
     * @param {Object} msg
     */
    pushToLobby: function(route, msg)
    {
        var channel = this.getLobbyChannel();
        if (channel) {
            channel.pushMessage(route, msg);
        }
    },

    /**
     * Pushes a message to the lobby
     *
     * @param {String} route
     * @param {Object} msg
     */
    pushToGlobal: function(route, msg)
    {
        console.log("Sending Global Update");
        var channel = this.getGlobalChannel();
        if (channel) {
            channel.pushMessage(route, msg);
        }
    },

    addToGlobalChannel: function(id, serverId)
    {
        var channel = this.getGlobalChannel();
        console.log("Adding to global channel: " + id + " / " + serverId);
        channel.add(id, serverId);
    },

    /**
     * Adds a player to the lobby channel and notifies the channel
     *
     * @param {Player} player
     */
    addPlayerToLobby: function(player)
    {
        var channel = this.getLobbyChannel();
        console.log("Adding to lobby channel: " + player.getId() + " / " + player.getServerId());
        channel.add(player.getId(), player.getServerId());
        channel.pushMessage('PlayerAdded', player.serialize());
    },

    /**
     * Adds a player to the channel of a shio
     *
     * @param {Ship}   ship
     * @param {Player} player
     */
    addPlayerToShip: function(ship, player)
    {
        var channel = this.getShipChannel(ship);
        channel.add(player.getId(), player.getServerId());
        channel.pushMessage('PlayerAddedToShip', player.serialize());
    },

    /**
     * Removes a player from the game and notifies the channel
     * @param player
     */
    removePlayerFromLobby: function(player)
    {
        var channel = this.getLobbyChannel();
        channel.leave(player.getId(), player.getServerId());
        channel.pushMessage('PlayerLeft', player.serialize());
    },

    /**
     * Returns a channel to a ship
     *
     * @param {Ship} ship
     *
     * @returns {Channel}
     */
    getShipChannel: function(ship)
    {
        return pomelo.app.get('channelService').getChannel('ship-' + ship.getId(), true);
    },

    /**
     * Returns a channel to the game lobby
     *
     * @returns {Channel}
     */
    getLobbyChannel: function() {
        return pomelo.app.get('channelService').getChannel('lobby', true);
    },

    /**
     * Returns a global channel
     *
     * @returns {Channel}
     */
    getGlobalChannel: function() {
        return pomelo.app.get('channelService').getChannel('global', true);
    }

});

module.exports = Channel;