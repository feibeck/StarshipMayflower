var _ = require('lodash');
var sylvester = require('sylvester');
var ObjectInSpace = require('../../../../shared/model/ObjectInSpace');
var util = require('util');

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
        engineering: null
    };

    me._size = {
        x: 0.027,
        y: 0.007,
        z: 0.020
    };

    me._model = "SpaceFighter02";

    me._targetImpulse = 0;
    me._currentImpulse = 0;

    me._lastMove = 0;

    ObjectInSpace.call(this);

};

util.inherits(Ship, ObjectInSpace);

_.extend(Ship.prototype, {

    _name: null,
    _creator: null,
    _stations: null,
    _players: null,
    _energy: 10000,
    _warpLevel: 0,
    _warpSpeed: 1,
    _warp: false,
    _slowImpulse: false,
    _targetImpulse: 0,
    _currentImpulse: 0,
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
        this.releaseStation('comm', player);
    },

    getRealVelocity: function()
    {
        if (!this._warp) {
            return this._velocity;
        }
        return this._warpSpeed * 299792.458;
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
     * Returns the current warp level of a ship
     *
     * @returns {Number}
     */
    getWarpLevel: function()
    {
        return this._warpLevel;
    },

    /**
     * Set the current warp level
     *
     * @param {Number} warpLevel
     *
     * @returns {Ship}
     */
    setWarpLevel: function(warpLevel)
    {
        this._warpLevel = warpLevel;
        return this;
    },

    /**
     * Returns the current warp speed (multiple of C) of a ship
     *
     * @returns {Number}
     */
    getWarpSpeed: function()
    {
        return this._warpSpeed;
    },

    /**
     * Set the current warp speed (multiple of C)
     *
     * @param {Number} warpSpeed
     *
     * @returns {Ship}
     */
    setWarpSpeed: function(warpSpeed)
    {
        this._warpSpeed = warpSpeed;
        return this;
    },

    /**
     * En- or disable warp engine
     *
     * @param {boolean} warp
     *
     * @returns {Ship}
     */
    setWarp: function(warp)
    {
        this._warp = warp;
        return this;
    },

    /**
     * Retuns wether the ship is going at warp speed
     *
     * @returns {boolean}
     */
    getWarp: function()
    {
        return this._warp;
    },

    /**
     * En- or disable slow impulse mode
     *
     * @param {boolean} warp
     *
     * @returns {Ship}
     */
    setSlowImpulse: function(slowImpulse)
    {
        this._slowImpulse = slowImpulse;
        return this;
    },

    /**
     * Retuns wether the ship is going at slow impulse speed
     *
     * @returns {boolean}
     */
    getSlowImpulse: function()
    {
        return this._slowImpulse;
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
        _.forEach(this._stations, function (playerOnStation, station) {
            if (playerOnStation && playerOnStation.getId() == player.getId()) {
                stations.push(station);
            }
        });
        return stations;
    },

    /**
     * Sets the available energy of the ship
     *
     * @param {Number} energy
     *
     * @returns {Ship}
     */
    setEnergy: function(energy)
    {
        this._energy = energy;
        return this;
    },

    /**
     * Returns the energy of the ship
     *
     * @returns {Number}
     */
    getEnergy: function()
    {
        return this._energy;
    },

    /**
     * Set the objects target speed
     *
     * @param {Integer} targetSpeed
     */
    setTargetImpulse: function(targetImpulse)
    {
        this._targetImpulse = targetImpulse;
        return this;
    },

    /**
     * Get the objects target speed
     *
     * @returns {Integer}
     */
    getTargetImpulse: function()
    {
        return this._targetImpulse;
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
     * Sets the timestamp of the last movement
     *
     * @param {Integer} lastMove
     * @return {ObjectInSpace}
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

        var shipX = this._orientation.multiply(sylvester.Vector.create([1, 0, 0]));
        var shipY = this._orientation.multiply(sylvester.Vector.create([0, 1, 0]));

        return {
            name: me.getName(),
            id: me.getId(),
            creator: creator,
            stations: {
                helm: (me._stations.helm ? me._stations.helm.getName() : ''),
                weapons: (me._stations.weapons ? me._stations.weapons.getName() : ''),
                science: (me._stations.science ? me._stations.science.getName() : ''),
                engineering: (me._stations.engineering ? me._stations.engineering.getName() : ''),
                comm: (me._stations.comm ? me._stations.comm.getName() : null)
            },
            position: {
                x: me._position.e(1),
                y: me._position.e(2),
                z: me._position.e(3)
            },
            speed: me.getRealVelocity(),
            targetImpulse: me._targetImpulse,
            currentImpulse: me._currentImpulse,
            slowImpulse: me._slowImpulse,
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            },
            shipX: {
                x: shipX.e(1),
                y: shipX.e(2),
                z: shipX.e(3)
            },
            shipY: {
                x: shipY.e(1),
                y: shipY.e(2),
                z: shipY.e(3)
            },
            energy: me._energy,
            warpLevel: me._warpLevel,
            warpSpeed: me._warpSpeed,
            warp: me._warp,
            orientation: me._orientation.elements,
            size: me._size,
            model: me._model
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
        var me = this,
            heading = me.getHeading();

        return {
            name: me.getName(),
            id: me.getId(),
            position: {
                x: me._position.e(1),
                y: me._position.e(2),
                z: me._position.e(3)
            },
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            },
            speed: me.getRealVelocity(),
            warpLevel: me._warpLevel,
            warp: me._warp,
            warpSpeed: me._warpSpeed,
            orientation: me._orientation.elements,
            size: me._size,
            model: me._model
        };
    }

});

module.exports = Ship;