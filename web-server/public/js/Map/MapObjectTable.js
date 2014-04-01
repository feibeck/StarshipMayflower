define([], function() {
    'use strict';

    function MapObjectTable() {
        this._hashtable = {};
        this._id = 1;
    }

    MapObjectTable.prototype.getId = function() {
        return this._id++;
    };

    MapObjectTable.prototype.set = function(id, object) {
        this._hashtable[id] = object;
        return this;
    };

    MapObjectTable.prototype.add = function(object) {
        var id = this.getId();

        this.set(id, object);
        return id;
    };

    MapObjectTable.prototype.get = function(id) {
        return this._hashtable[id];
    };

    return MapObjectTable;

});