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
    me._velocity = 0;
    me._orientation = sylvester.Matrix.I(3);

    me.INITIAL_HEADING = sylvester.Vector.create([0, 0, 1]);

    me._lastMove = 0;

    me._targetImpulse = 0;
    me._currentImpulse = 0;

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
    _targetImpulse: 0,
    _currentImpulse: 0,

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
     * @param {float}
     * @returns {Ship}
     */
    setVelocity: function(velocity) {
        this._velocity = velocity;
        return this;
    },

    /**
     * Returns the ships velocity vector
     *
     * @returns {float}
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
        return this._orientation.multiply(this.INITIAL_HEADING);
    },

    /**
     * Set orientation.
     *
     * @param orientation
     * @returns {Ship}
     */
    setOrientation: function(orientation) {
        this._orientation = orientation;
        return this;
    },

    /**
     * Get orientation
     *
     * @returns {sylvester.Matrix}
     */
    getOrientation: function() {
        return this._orientation;
    },

    /**
     * Sets the position of the ship
     *
     * @param {sylvester.Vector} position
     * @return {Ship}
     */
    setPosition: function(position) {
        this._position = position;
        return this;
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
     * @return {Ship}
     */
    setLastMove: function(lastMove) {
        this._lastMove = lastMove;
        return this;
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
     * Set the ships target speed
     *
     * @param {Integer} targetSpeed
     */
    setTargetImpulse: function(targetImpulse)
    {
        this._targetImpulse = targetImpulse;
        return this;
    },

    /**
     * Sets the current impulse speed
     *
     * @param {Integer} currentImpulse
     */
    setCurrentImpulse: function(currentImpulse)
    {
        this._currentImpulse = currentImpulse;
        return this;
    },

    /**
     * Returns the current impulse speed
     *
     * @return {Integer}
     */
    getCurrentImpulse: function()
    {
        return this._currentImpulse;
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
     * Returns all stations a player is stationed on
     *
     * @param player
     *
     * @returns {Array}
     */
    stationsForPlayer: function(player)
    {
        var stations = [];
        _(this._stations).each(function (playerOnStation, station) {
            if (playerOnStation && playerOnStation.getId() == player.getId()) {
                stations.push(station);
            }
        });
        return stations;
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
        var me = this,
            heading = me.getHeading();

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
            speed: me.getVelocity(),
            targetImpulse: me._targetImpulse,
            currentImpulse: me._currentImpulse,
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            }
        };
    },

    /**
     * Returns data neede for showing the ship on a map
     *
     * @returns {{
     *     name: String,
     *     id: Integer,
     *     position: {x: *, y: *, z: *},
     *     speed: *,
     *     heading: {x: *, y: *, z: *}
     * }}
     */
    serializeMapData: function()
    {
        var me = this;
        return {
            name: me.getName(),
            id: me.getId(),
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