var _ = require('lodash');
var sylvester = require('sylvester');

/**
 * Base class for all kind of objects that exist in space
 *
 * @constructor
 */
var ObjectInSpace = function()
{

    var me = this;

    me._id = 0;

    me._position = sylvester.Vector.create([0, 0, 0]);
    me._velocity = 0;
    me._orientation = sylvester.Matrix.I(3);
    me.INITIAL_HEADING = sylvester.Vector.create([0, 0, 1]);

    me._lastMove = 0;

    me._targetImpulse = 0;
    me._currentImpulse = 0;

};

_.extend(ObjectInSpace.prototype, {

    _id: null,
    _position: null,
    _velocity: null,
    _heading: null,
    _lastMove: null,
    _targetImpulse: 0,
    _currentImpulse: 0,


    /**
     * Set the objects id
     *
     * @param {Integer} id
     *
     * @returns {ObjectInSpace}
     */
    setId: function(id)
    {
        this._id = id;
        return this;
    },

    /**
     *
     * Returns the objects id
     *
     * @returns {Integer}
     */
    getId: function() {
        return this._id;
    },

    /**
     * Sets the objects velocity vector
     *
     * @param {float}
     * @returns {ObjectInSpace}
     */
    setVelocity: function(velocity) {
        this._velocity = velocity;
        return this;
    },

    /**
     * Returns the objects velocity vector
     *
     * @returns {float}
     */
    getVelocity: function() {
        return this._velocity;
    },

    /**
     * Returns the heading vector of the object
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
     * @returns {ObjectInSpace}
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
     * Sets the position of the object
     *
     * @param {sylvester.Vector} position
     * @return {ObjectInSpace}
     */
    setPosition: function(position) {
        this._position = position;
        return this;
    },

    /**
     * Returns the position of the object
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
     * Returns data need for showing the object on a map
     *
     * @returns {{
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
            id: me.getId(),
            position: {
                x: me._position.e(1),
                y: me._position.e(2),
                z: me._position.e(3)
            },
            speed: me.getRealVelocity(),
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            }
        };
    }

});

module.exports = ObjectInSpace;