var _ = require('lodash');

var INDEX = 1;
function newIndex() {
    return INDEX++;
}

/**
 * Registry of all objects in space
 *
 * @constructor
 */
var ObjectRegistry = function()
{
    var me = this;
    me._objects = {};
};

_.extend(ObjectRegistry.prototype, {

    _objects: null,

    /**
     * Adds a space object to the registry
     *
     * @param {ObjectInSpace} spaceObject
     *
     * @returns {ObjectRegistry}
     */
    addObject: function(spaceObject)
    {
        var index = this.createId();
        spaceObject.setId(index);
        this._objects[index] = spaceObject;
        return this;
    },

    /**
     * Returns a list with all objects
     *
     * @returns {array}
     */
    getAllObjects: function()
    {
        return this._objects;
    },

    createId: function()
    {
        return newIndex();
    }

});

module.exports = ObjectRegistry;