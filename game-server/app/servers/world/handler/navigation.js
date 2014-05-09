var _ = require('lodash'),
    game = require('../../../src/game'),
    Accelerate = require('../../../src/action/accelerate'),
    Turn = require('../../../src/action/turn');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

_.extend(Handler.prototype, {

    setImpulseSpeed: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        ship.setTargetImpulse(msg.targetSpeed);

        var targetSpeed = msg.targetSpeed;

        var action = new Accelerate({
            ship: ship,
            targetSpeed: targetSpeed
        });

        game.timer().addAction(action);
    },

    setWarp: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        ship.setWarp(msg.warp);
    },

    setWarpLevel: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        ship.setWarpLevel(msg.targetSpeed);
        ship.setWarpSpeed(1 + (3 * (msg.targetSpeed/100)));
    },

    turn: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        var arc = msg.arc;

        var action = new Turn({ship: ship, arc: arc, axis: msg.axis});
        game.timer().addAction(action);
    }

});
