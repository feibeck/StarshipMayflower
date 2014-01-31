var world = require('./world');

var shipRoster = new world.ShipRoster();

module.exports = {
    getShipRoster: function() {
        return shipRoster;
    }
};