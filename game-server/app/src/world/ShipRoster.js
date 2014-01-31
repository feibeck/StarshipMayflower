var _ = require('lodash'),
    models = require('../models');

var INDEX = 0;
function newIndex() {
    return INDEX++;
}

var ShipRoster = function() {
    var me = this;

    me._ships = {};

    me.addShip(new models.Ship('Artemis'));
    me.addShip(new models.Ship('Titanic'));
    me.addShip(new models.Ship('Enterprise'));
    me.addShip(new models.Ship('Firefly'));
    me.addShip(new models.Ship('Nebukadnezar'));
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