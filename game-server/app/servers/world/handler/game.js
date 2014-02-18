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
        game.start();
    }

});
