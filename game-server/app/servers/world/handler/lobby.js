var _ = require('lodash'),
    game = require('../../../src/game'),
    models = require('../../../src/models'),
    Channel = require('../../../src/channel');

var channel = new Channel();

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

        var shipRegistry = game.getShipRegistry(),
            shipList = _.map(shipRegistry.getAllShips(), function(ship) {
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

        var shipRegistry = game.getShipRegistry();

        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(msg.shipId);

        if (!ship) {
            next(new Error('Unknown ship'), {code: 'ERR', payload: {}});
            return;
        }

        shipRegistry.addPlayerToShip(ship, player);

        next(null, {code: 'OK', payload: ship.serialize()});
    },

    addNewShip: function(msg, session, next)
    {
        var shipRegistry = game.getShipRegistry(),
            playerId = session.get('playerId'),
            player,
            ship;

        if (!playerId) {
            error = new Error('User not logged in');
            next(error, {
                code: 'ERR',
                payload: {
                    error: error.message
                }
            });
            return;
        }

        player = shipRegistry.getPlayer(playerId);
        ship = shipRegistry.addShip(new models.Ship(msg), player);

        if (!ship.isError) {
            next(null, {
                    code: 'OK',
                    payload: ship.serialize()
            });
        } else {
            var error = ship;
            next(error, {
                code: "ERR",
                payload: {
                    error: error.message
                }
            });
        }
    },

    addPlayer: function(msg, session, next)
    {
        var shipRegistry = game.getShipRegistry();
        var player = new models.Player(msg.playerId, msg.name, session.frontendId);

        player = shipRegistry.addPlayer(player);

        if (!player.isError) {
            next(null, {
                code: "OK",
                payload: {}
            });
        } else {
            var error = player;
            next(error, {
                code: "ERR",
                payload: {
                    error: error.message
                }
            });
        }
    },

    registerViewer: function(msg, session, next)
    {
        channel.addToGlobalChannel(
            session.get('viewerId'),
            session.frontendId
        );

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

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        var success = shipRegistry.takeStation(ship, player, msg.position);

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

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);
        var ship = shipRegistry.getShip(player.getShip().getId());

        var success = shipRegistry.releaseStation(ship, player, msg.position);

        if (success) {
            next(null, {code: 'OK', payload: ship.serialize()});
        } else {
            next(new Error('Position not taken by player'), {code: 'ERR', payload: {}});
        }
    },

    readyToPlay: function(msg, session, next)
    {
        var playerId = session.get('playerId');

        if (!playerId) {
            next(new Error('User not logged in'), {code: 'ERR', payload: {}});
            return;
        }

        var shipRegistry = game.getShipRegistry();
        var player = shipRegistry.getPlayer(playerId);

        player.setReadyToPlay(msg);

        var allReady = true;
        _.forEach(shipRegistry.getAllPlayers(), function(player) {
            if (!player.getReadyToPlay()) {
                allReady = false;
            }
        });

        if (allReady && !game.isRunning()) {
            game.start();
            channel.pushToLobby('GameStarted', {});
        }

        next(null, {code: 'OK', payload: game.isRunning()});
    }

});
