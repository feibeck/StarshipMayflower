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

    addNewShip: function(msg, session, next)
    {
        if (!session.get('playerId')) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRoster = game.getShipRoster(),
            ship = shipRoster.addShip(new models.Ship(msg));

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
    }

});
