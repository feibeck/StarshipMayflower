var _ = require('lodash');

/**
 * Player model
 *
 * @param {Integer} id
 * @param {String}  name
 * @param {String}  serverId
 *
 * @constructor
 */
var Player = function(id, name, serverId) {
    this._id = id;
    this._name = name;
    this._serverId = serverId;
};

_.extend(Player.prototype, {

    _id: null,
    _name: null,
    _serverId: null,
    _ship: null,

    /**
     * Returns the players id
     *
     * @return {Integer}
     */
    getId: function() {
        return this._id;
    },

    /**
     * Returns the players name
     *
     * @returns {String}
     */
    getName: function() {
        return this._name;
    },

    /**
     * Returns the server id the player is registered with
     *
     * @returns {String}
     */
    getServerId: function() {
        return this._serverId;
    },

    /**
     * Set the ship the player is playing
     *
     * @param {Ship}
     */
    setShip: function(ship)
    {
        this._ship = ship;
    },

    /**
     * Returns the ship the player is registered with
     *
     * @returns {Ship}
     */
    getShip: function()
    {
        return this._ship;
    },

    /**
     * Returns a JSON representation of the player
     *
     * @returns {{id: Integer, name: String}}
     */
    serialize: function() {
        return {
            id:   this.getId(),
            name: this.getName()
        };
    }

});

module.exports = Player;