var world = require('./world'),
    ActionManager = require('./action/actionManager'),
    timer = require('./timer'),
    _ = require('lodash'),
    pomelo = require('pomelo'),
    Channel = require('./channel'),
    physics = require('./physics'),
    Station = require('./models/Station'),
    Planet = require('./models/Planet'),
    sylvester = require('sylvester');;

var channel = new Channel();

var running = false;

var shipRegistry = new world.ShipRegistry();
var objectRegistry = new world.ObjectRegistry();
var actionManager = new ActionManager();

var spaceStationOne = new Station('Space Station One');
spaceStationOne.setPosition(world.getRandomPosition());
objectRegistry.addObject(spaceStationOne);

var spaceStationTwo = new Station('Space Station Two');
spaceStationTwo.setPosition(world.getRandomPosition());
objectRegistry.addObject(spaceStationTwo);

var sun = new Planet(
    "Sun",
    {
        x: 1392684,
        y: 1392684,
        z: 1392684
    },
    "Sun"
);
sun.setPosition(sylvester.Vector.create([world.AU, world.AU, world.AU]));
objectRegistry.addObject(sun);

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

exp.getWorld = function()
{
    return world;
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

exp.getObjectRegistry = function()
{
    return objectRegistry;
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

    _.forEach(objectRegistry.getAllObjects(), function(spaceObject) {
        ships.push(spaceObject.serializeMapData());
    });

    channel.pushToShip(ship, 'WorldUpdate', {ship: ship.serialize(), ships: ships});
};

exp.timer = function() {
    return timer;
};
