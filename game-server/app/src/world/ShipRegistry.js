var _ = require('lodash'),
    pomelo = require('pomelo'),
    models = require('../models'),
    Channel = require('../channel'),
    CustomError = require('../customError');

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
    me._game = require('../game');
};

_.extend(ShipRegistry.prototype, {

    _ships: null,
    _players: null,
    _game : null,

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
            index = me._game.getObjectRegistry().createId();

        if (!ship) {
            return new CustomError('Ship must not be empty');
        } else if (me.getShipByName(ship.getName())) {
            return new CustomError('Ship already exists');
        }

        ship.setId(index);
        ship.setCreator(player);
        ship.setPosition(me._game.getWorld().getRandomPosition());

        me._ships[index] = ship;

        channel.pushToLobby('ShipAdded', ship.serialize());

        return ship;
    },

    /**
     * Gets a ship by its name.
     *
     * @param {String} shipName
     * @returns {(Ship|null)}
     */
    getShipByName: function(shipName) {
        var me = this,
            shipList = me.getAllShips(),
            result = null;

        _.forEach(shipList, function(ship) {
            if (ship.getName() == shipName) {
                result = ship;
                return false; // break forEach
            }
        });

        return result;
    },

    /**
     * Adds a player
     *
     * @param {Player} player
     *
     * @returns {(Player|CustomError)}
     */
    addPlayer: function(player)
    {
        var me = this;

        if (!player) {
            return new CustomError('Player must not be empty');
        } else if (me.getPlayerByName(player.getName())) {
            return new CustomError('Player already exists');
        }

        me._players[player.getId()] = player;
        channel.addPlayerToLobby(player);

        return player;
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
     * Gets a player by its name.
     *
     * @param {String} playerName
     * @returns {(Player|null)}
     */
    getPlayerByName: function(playerName) {
        var me = this,
            playerList = me.getAllPlayers(),
            result = null;

        _.forEach(playerList, function(player) {
            if (player.getName() == playerName) {
                result = player;
                return false; // break forEach
            }
        });

        return result;
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
    }

});

module.exports = ShipRegistry;
