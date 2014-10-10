var _ = require('lodash');
var sylvester = require('sylvester');
var ObjectInSpace = require('./ObjectInSpace');
var util = require('util');

/**
 * Space station model
 *
 * @param {String}  name
 *
 * @constructor
 */
var Planet = function(name, size, model) {

    var me = this;

    me._name = name;

    me._size = size;

    me._model = model;

    ObjectInSpace.call(this);

};

util.inherits(Planet, ObjectInSpace);

_.extend(Planet.prototype, {

    _name: null,

    /**
     * Returns the planets name
     *
     * @returns {String}
     */
    getName: function()
    {
        return this._name;
    },

    /**
     * Returns data neede for showing the planet on a map
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
            speed: me.getVelocity(),
            heading: {
                x: heading.e(1),
                y: heading.e(2),
                z: heading.e(3)
            },
            orientation: me._orientation.elements,
            size: me._size,
            model: me._model
        };
    }

});

module.exports = Planet;