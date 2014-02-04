var _ = require('lodash'),
    game = require('../../../src/game'),
    models = require('../../../src/models');


module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

_.extend(Handler.prototype, {

    listAvailableShips: function(msg, session, next)
    {
        if (!session.get('playerId')) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster(),
            shipList = _.map(shipRoster.getAllShips(), function(ship) {
                return ship.serialize();
            });

        next(null, {code: 'OK', payload: shipList});
    },

    joinShip: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster();

        var player = shipRoster.getPlayer(playerId);
        var ship = shipRoster.getShip(msg.shipId)

        if (!ship) {
            next(new Error('Unknown ship'), {code: 'ERR', payload: {}});
            return;
        }

        shipRoster.addPlayerToShip(ship, player);

        next(null, {code: 'OK', payload: ship.serialize()});
    },

    addNewShip: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster();
        var player = shipRoster.getPlayer(playerId);
        var ship = shipRoster.addShip(new models.Ship(msg), player);

        next(null, {code: 'OK', payload: ship.serialize()});
    },

    addPlayer: function(msg, session, next)
    {
        var shipRoster = game.getShipRoster();
        var player = new models.Player(msg.playerId, msg.name, session.frontendId);

        shipRoster.addPlayer(player);

        next(null, {
            code: "OK",
            payload: {}
        });
    },

    takeStation: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster();
        var player = shipRoster.getPlayer(playerId);
        var ship = shipRoster.getShip(player.getShip().getId());

        var success = shipRoster.takeStation(ship, player, msg.position);

        if (success) {
            next(null, {code: 'OK', payload: ship.serialize()});
        } else {
            next(new Error('Position already taken'), {code: 'ERR', payload: {}});
        }
    },

    releaseStation: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster();
        var player = shipRoster.getPlayer(playerId);
        var ship = shipRoster.getShip(player.getShip().getId());

        var success = shipRoster.releaseStation(ship, player, msg.position);

        if (success) {
            next(null, {code: 'OK', payload: ship.serialize()});
        } else {
            next(new Error('Position not taken by player'), {code: 'ERR', payload: {}});
        }
    }

});
