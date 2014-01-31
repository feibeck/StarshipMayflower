var _ = require('lodash'),
    models = require('../models');

var ShipRoster = function() {
    var me = this;

    me._ships = [
        new models.Ship('Artemis'),
        new models.Ship('Titanic'),
        new models.Ship('Enterprise'),
        new models.Ship('Firefly'),
        new models.Ship('Nebukadnezar')
    ];
};

_.extend(ShipRoster.prototype, {
    _ships: null,

    getShips: function() {
        return this._ships;
    }
});

module.exports = ShipRoster;