var _ = require('lodash'),
    pomelo = require('pomelo'),
    models = require('../models'),
    Channel = require('../channel');

var INDEX = 1;
function newIndex() {
    return INDEX++;
}

var channel = new Channel();

/**
 * Registry of all ships
 *
 * @constructor
 */
var ShipRegistry = function()
{
    var me = this;
    me._ships = {};
    me._players = {};
};

_.extend(ShipRegistry.prototype, {

    _ships: null,
    _players: null,

    /**
     * Returns a list of all ships
     *
     * @returns {Array}
     */
    getAllShips: function()
    {
        return _.values(this._ships);
    },

    /**
     * Returns a ship by id
     *
     * @param {Integer} shipId
     *
     * @returns {Ship}
     */
    getShip: function(shipId)
    {
        var me = this;
        var ship = me._ships[shipId];
        return ship;
    },

    /**
     * Adds a ship
     *
     * @param {Ship} ship
     * @param {Player} player
     *
     * @returns {Ship}
     */
    addShip: function(ship, player)
    {
        var me = this,
            index = newIndex(),
            inShipList = me.checkForNameDuplicate(ship.getName(), me.getAllShips());

        if (ship && !inShipList) {
            ship.setId(index);
            ship.setCreator(player);

            me._ships[index] = ship;

            channel.pushToLobby('ShipAdded', ship.serialize());

            return ship;
        }

        return null;
    },

    /**
     * Adds a player
     *
     * @param {Player} player
     *
     * @returns {boolean}
     */
    addPlayer: function(player)
    {
        var me = this,
            inPlayerList = me.checkForNameDuplicate(player.getName(), me.getAllPlayers());

        if (player && !inPlayerList) {
            me._players[player.getId()] = player;
            channel.addPlayerToLobby(player);
            return true;
        }

        return false;
    },

    /**
     * Returns a player by its id property
     *
     * @param {Integer} playerId
     *
     * @returns {Player}
     */
    getPlayer: function(playerId)
    {
        var me = this;
        var player = me._players[playerId];
        return player;
    },

    /**
     * Returns all players
     *
     * @returns {Array}
     */
    getAllPlayers: function()
    {
        return this._players;
    },

    /**
     * Removes a player
     *
     * @param {Integer} playerId
     */
    removePlayer: function(playerId)
    {
        var me = this;
        var player = me._players[playerId];

        var ship = player.getShip();
        if (ship) {
            player.setShip(null);
            ship.removePlayer(player);
            channel.pushToShip(ship, 'StationReleased', ship.serialize());
        }

        channel.removePlayerFromLobby(player);

        delete me._players[playerId];
    },

    /**
     * Registers a player with a ship
     *
     * @param {Ship} ship
     * @param {Player} player
     */
    addPlayerToShip: function(ship, player)
    {
        ship.addPlayer(player);
        player.setShip(ship);
        channel.addPlayerToShip(ship, player);
    },

    /**
     * Register a player to a station of a ship
     *
     * @param {Ship} ship
     * @param {Player} player
     * @param {String} position
     *
     * @returns {boolean}
     */
    takeStation: function(ship, player, position)
    {
        var success = ship.takeStation(position, player);
        if (success) {
            channel.pushToShip(ship, 'StationTaken', ship.serialize());
        }
        return success;
    },

    /**
     * Releases a player from a station of a ship
     *
     * @param {Ship} ship
     * @param {Player} player
     * @param {String} position
     *
     * @returns {boolean}
     */
    releaseStation: function(ship, player, position)
    {
        var success = ship.releaseStation(position, player);
        if (success) {
            channel.pushToShip(ship, 'StationReleased', ship.serialize());
        }
        return success;
    },

    /**
     * Checks if current playername is already used by another player
     *
     * @param {Player} player
     * @returns {boolean} inList
     */
    checkForPlayerInList: function(player) {
        var me = this;
        var newPlayerName = player.getName();
        var playerList = me.getAllPlayers();
        var inList = false;

        _.forEach(playerList, function(playerInList) {
            playerName = playerInList.getName();
            if (newPlayerName == playerName && !inList) {
                inList = true;
            }
        })

        return inList;

    },

    /**
     * Checks for duplicated name in the collections.
     * @param {string} name
     * @param {array} collection
     * @returns {boolean} hasDuplicatedEntry
     */
    checkForNameDuplicate: function(name, collection) {
        var hasDuplicatedEntry = false;
        _.forEach(collection, function(entry) {
            if (name == entry.getName()) {
                hasDuplicatedEntry = true;
            }
        });
        return hasDuplicatedEntry;
    }

});

module.exports = ShipRegistry;
