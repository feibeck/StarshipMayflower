var _ = require('lodash');
var sylvester = require('sylvester');

/**
 * Ship model
 *
 * @param {String}  name
 *
 * @constructor
 */
var Ship = function(name) {

    var me = this;

    me._name = name;
    me._creator = null;
    me._players = [];

    me._stations = {
        helm: null,
        weapons: null,
        comm: null,
        science: null,
        engineering: null,
        mainscreen: null
    };

    me._position = sylvester.Vector.create([0, 0, 0]);
    me._velocity = sylvester.Vector.create([0, 0, 0]);
    me._heading = sylvester.Vector.create([0, 0, -1]);

    me._lastMove = 0;

};

_.extend(Ship.prototype, {

    _id: null,
    _name: null,
    _creator: null,
    _stations: null,
    _players: null,
    _position: null,
    _velocity: null,
    _heading: null,
    _lastMove: null,

    /**
     * Returns the ships name
     *
     * @returns {String}
     */
    getName: function()
    {
        return this._name;
    },

    /**
     * Set the ships id
     *
     * @param {Integer} id
     *
     * @returns {Ship}
     */
    setId: function(id)
    {
        this._id = id;
        return this;
    },

    /**
     *
     * Returns the ships id
     *
     * @returns {Integer}
     */
    getId: function() {
        return this._id;
    },

    /**
     * Registeres a player with the ship
     *
     * @param {Player} player
     */
    addPlayer: function(player)
    {
        this._players[player.getId()] = player;
    },

    /**
     * Removes a player from the ship
     *
     * @param {Player} player
     */
    removePlayer: function(player)
    {
        delete this._players[player.getId()];

        this.releaseStation('helm', player);
        this.releaseStation('weapons', player);
        this.releaseStation('engineering', player);
        this.releaseStation('science', player);
        this.releaseStation('mainscreen', player);
        this.releaseStation('comm', player);
    },

    /**
     * Sets the ships velocity vector
     *
     * @param {sylvester.Vector} velocity
     */
    setVelocity: function(velocity) {
        this._velocity = velocity;
    },

    /**
     * Returns the ships velocity vector
     *
     * @returns {sylvester.Vector}
     */
    getVelocity: function() {
        return this._velocity;
    },

    /**
     * Returns the heading vector of the ship
     *
     * @returns {sylvester.Vector}
     */
    getHeading: function() {
        return this._heading;
    },

    /**
     * Sets the heading vector of the ship
     *
     * @param {sylvester.Vector} heading
     */
    setHeading: function(heading) {
        this._heading = heading;
    },

    /**
     * Sets the position of the ship
     *
     * @param {sylvester.Vector} position
     */
    setPosition: function(position) {
        this._position = position;
    },

    /**
     * Returns the position of the ship
     *
     * @returns {sylvester.Vector}
     */
    getPosition: function() {
        return this._position;
    },

    /**
     * Sets the timestamp of the last movement
     *
     * @param {Integer} lastMove
     */
    setLastMove: function(lastMove) {
        this._lastMove = lastMove;
    },

    /**
     * Returns the timestamp of the last movement
     *
     * @returns {Integer}
     */
    getLastMove: function() {
        return this._lastMove;
    },

    /**
     * Sets the creator of the ship
     *
     * @param {Player} player
     *
     * @returns {Ship}
     */
    setCreator: function(player)
    {
        this._creator = player;
        return this;
    },

    /**
     * Returns the creator of the ship
     *
     * @returns {Player}
     */
    getCreator: function()
    {
        return this._creator;
    },

    /**
     * Register a player with a station
     *
     * @param {String} station
     * @param {Player} player
     *
     * @returns {boolean}
     */
    takeStation: function(station, player)
    {
        if (this._stations[station]) {
            return false;
        }
        this._stations[station] = player;
        return true;
    },

    /**
     * Releases a station from a player
     *
     * @param {String} station
     * @param {Player} player
     *
     * @returns {boolean}
     */
    releaseStation: function(station, player)
    {
        if (this._stations[station] != player) {
            return false;
        }
        this._stations[station] = null;
        return true;
    },

    /**
     * Returns a JSON representation of the ship
     *
     * @returns {{
     *     name: String,
     *     id: Integer,
     *     creator: Player,
     *     stations: {
     *         helm: String,
     *         weapons: String,
     *         science: String,
     *         engineering: String,
     *         comm: String,
     *         mainscreen: String
     *     },
     *     position: {x: Float, y: Float, z: Float},
     *     speed: Float,
     *     heading: {x: Float, y: Float, z: Float}
     * }}
     */
    serialize: function() {
        var me = this;

        var creator;
        if (me._creator) {
            creator = me._creator.serialize();
        }

        return {
            name: me.getName(),
            id: me.getId(),
            creator: creator,
            stations: {
                helm: (me._stations.helm ? me._stations.helm.getName() : ''),
                weapons: (me._stations.weapons ? me._stations.weapons.getName() : ''),
                science: (me._stations.science ? me._stations.science.getName() : ''),
                engineering: (me._stations.engineering ? me._stations.engineering.getName() : ''),
                comm: (me._stations.comm ? me._stations.comm.getName() : null),
                mainscreen: (me._stations.mainscreen ? me._stations.mainscreen.getName() : '')
            },
            position: {
                x: me._position.e(1),
                y: me._position.e(2),
                z: me._position.e(3)
            },
            speed: me.getVelocity().modulus(),
            heading: {
                x: me._heading.e(1),
                y: me._heading.e(2),
                z: me._heading.e(3)
            }
        };
    }

});

module.exports = Ship;