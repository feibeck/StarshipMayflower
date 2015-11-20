var EventEmitter = require('events').EventEmitter;
var util = require('util');

function ObjectInSpaceRegistry() {
    EventEmitter.call(this);
    
    this._hashtable = {};
    this._dirty = true;
    this._list = [];
}

util.inherits(ObjectInSpaceRegistry, EventEmitter);

ObjectInSpaceRegistry.prototype.push = function (object) {
    this._hashtable[object.getId()] = object;
    this._dirty = true;
    this.emit('update');
    
    return this;
};

ObjectInSpaceRegistry.prototype.updateObject = function(object) {
    if (!this._hashtable[object.getId()]) {
        this.push(object);
    }  
    this._hashtable[object.getId()] = object;
    this._dirty = true;
    this.emit('update');
};

ObjectInSpaceRegistry.prototype.getAllObjects = function () {
    return this._getList();
};

ObjectInSpaceRegistry.prototype.getObject = function (id) {
    return this._hashtable[id];
};

/**
 * Determine all objects whose positions lie within a sphere of given radius
 * around a given origin.
 * 
 * @param {sylvester.Vector} origin
 * @param {number} radius
 * 
 * @result {array}
 */
ObjectInSpaceRegistry.prototype.getSurroundings = function(origin, radius) {
    var list = this._getList(),
        surroundings = [];
    
    list.forEach(function(o) {
        if (origin.subtract(o.getPosition()).modulus() < radius) {
            surroundings.push(o);
        }
    });
    
    return surroundings;
};

ObjectInSpaceRegistry.prototype._getList = function() {
    var me = this;
    
    if (me._dirty) {
        me._list = [];
        Object.keys(me._hashtable).forEach(function(id) {
            me._list.push(me._hashtable[id]);
        });

        me._dirty = false;
    }
    
    return me._list;
};

module.exports = ObjectInSpaceRegistry;