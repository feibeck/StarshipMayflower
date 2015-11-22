var _ = require('lodash');
var sylvester = require('sylvester');
var Point = require('./volume/Point');

/**
 * A thing that exists in space and time.
 */
var ObjectInSpace = function()
{
    var me = this;
    me._id = 0;
    me._position = sylvester.Vector.create([0, 0, 0]);
    me._velocity = 0;
    me._orientation = sylvester.Matrix.I(3);
    me.INITIAL_HEADING = sylvester.Vector.create([0, 0, 1]);
    me._volume = new Point();
};

_.extend(ObjectInSpace.prototype, {

    _id: null,
    _position: null,
    _velocity: null,
    _heading: null,
    _size: null,
    _model: "",
    _volume: null,

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

    setVolume: function(volume) {
        this._volume = volume;
        return this;
    },

    getVolume: function() {
        return this._volume;
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
            orientation: me._orientation.elements,
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            }
        };
    },

    fromJson: function(json) {
        this.setOrientation(sylvester.Matrix.create(json.orientation));
        this.setPosition(
            sylvester.Vector.create([
                json.position.x,
                json.position.y,
                json.position.z
            ])
        );
        this.setVelocity(json.velocity);
    }

});

module.exports = ObjectInSpace;