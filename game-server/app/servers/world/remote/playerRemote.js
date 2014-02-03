var _ = require('lodash'),
    game = require('../../../src/game'),
    models = require('../../../src/models');

var exp = module.exports;

exp.playerLeave = function(args) {
    var playerId = args.playerId;
    var shipRoster = game.getShipRoster();
    shipRoster.removePlayer(playerId);
};

