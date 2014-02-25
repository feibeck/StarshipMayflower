var world = require('./world'),
    ActionManager = require('./action/actionManager'),
    timer = require('./timer'),
    _ = require('lodash'),
    pomelo = require('pomelo'),
    Channel = require('./channel');

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

    var position = ship.getPosition();

    var velocity = ship.getVelocity();
    var movement = velocity.multiply(seconds);

    var newPosition = position.add(movement);

    var elements = [newPosition.e(1), newPosition.e(2), newPosition.e(3)];

    if (newPosition.e(1) < 0) {
	elements[0] = 0;
    } else if (newPosition.e(1) > world.PlayingFieldLength) {
	elements[0] = world.PlayingFieldLength;
    }
    if (newPosition.e(2) < 0) {
	elements[1] = 0;
    } else if (newPosition.e(2) > world.PlayingFieldLength) {
	elements[1] = world.PlayingFieldLength;
    }
    if (newPosition.e(3) < 0) {
	elements[2] = 0;
    } else if (newPosition.e(3) > world.PlayingFieldLength) {
	elements[3] = world.PlayingFieldLength;
    }

    newPosition.setElements(elements);

    ship.setPosition(newPosition);
    ship.setLastMove(Date.now());

    channel.pushToShip(ship, 'ShipUpdate', ship.serialize());
};

exp.timer = function() {
    return timer;
};
