var _ = require('lodash'),
    game = require('../../../../src/game');


module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

_.extend(Handler.prototype, {
    listAvailableShips: function(msg, session, next) {
        var shipRoster = game.getShipRoster(),
            shipList = _.map(shipRoster.getShips(), function(ship) {
                return ship.getName()
            });

        next(null, {
            code: 200,
            payload: {
                ships: shipList
            }
        })
    }
});
