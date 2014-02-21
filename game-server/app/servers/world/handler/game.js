var _ = require('lodash'),
    game = require('../../../src/game');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

_.extend(Handler.prototype, {

    start: function(msg, session, next)
    {
        var playerId = session.get('playerId');
        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = player.getShip();

        var stations = ship.stationsForPlayer(player);

        next(null, {code: 'OK', payload: stations});
    }

});
