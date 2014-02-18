var _ = require('lodash'),
    game = require('../../../src/game');

var exp = module.exports;

exp.playerLeave = function(args) {
    var playerId = args.playerId;
    var shipRegistry = game.getShipRegistry();
    shipRegistry.removePlayer(playerId);
};

