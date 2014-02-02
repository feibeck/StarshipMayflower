var _ = require('lodash'),
    models = require('../models');

var INDEX = 0;
function newIndex() {
    return INDEX++;
}

var ShipRoster = function() {
    var me = this;
    me._ships = {};
};

_.extend(ShipRoster.prototype, {
    _ships: null,

    getAllShips: function() {
        return _.values(this._ships);
    },

    addShip: function(ship) {
        var me = this,
            index = newIndex();

        ship.setId(index);
        me._ships[index] = ship;

        return ship;
    }
});

module.exports = ShipRoster;