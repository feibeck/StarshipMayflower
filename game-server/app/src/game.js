var world = require('./world'),
    ActionManager = require('./action/actionManager'),
    timer = require('./timer'),
    _ = require('lodash'),
    pomelo = require('pomelo'),
    Channel = require('./channel'),
    physics = require('./physics');

var channel = new Channel();

var running = false;

var shipRegistry = new world.ShipRegistry();
var actionManager = new ActionManager();

var exp = module.exports;

exp.getShipRegistry = function() {
    return shipRegistry;
};

exp.start = function() {
    if (!running) {
        timer.run(actionManager);
        running = true;
    }
};

exp.isRunning = function()
{
    return running;
};

exp.getActionManager = function() {
    return actionManager;
};

exp.moveShips = function() {
    var me = this;
    _.forEach(shipRegistry.getAllShips(), function(ship) {
        me.moveShip(ship);
    });
};

exp.moveShip = function(ship) {
    var lastMove = ship.getLastMove();
    var seconds = (Date.now() - lastMove) / 1000;

    physics.moveShip(ship, seconds);
    ship.setLastMove(Date.now());

    channel.pushToShip(ship, 'ShipUpdate', ship.serialize());
};

exp.sendUpdates = function()
{
    var me = this;
    _.forEach(shipRegistry.getAllShips(), function(ship) {
        me.sendKnownWorld(ship);
    });
};

exp.sendKnownWorld = function(ship)
{
    var ships = [];
    _.forEach(shipRegistry.getAllShips(), function(othership) {
        if (ship != othership) {
            ships.push(othership.serializeMapData());
        }
    });

    channel.pushToShip(ship, 'WorldUpdate', {ship: ship.serialize(), ships: ships});
}

exp.timer = function() {
    return timer;
};
