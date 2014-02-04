var _ = require('lodash');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
    this.serverId = app.get('serverId').split('-')[2];
};

var id = 1;

var onUserLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.rpc.world.playerRemote.playerLeave(session, {playerId: session.get('playerId')}, null);
    }
};

_.extend(Handler.prototype, {

    entry: function(msg, session, next) {
        var self = this;
        var playerId = parseInt(this.serverId + id, 10);
        id += 1;
        session.bind(playerId);
        session.set('playerId', playerId);
        session.set('playername', msg.username);
        session.on('closed', onUserLeave.bind(null, self.app));
        session.pushAll();

        console.log("Session for player " + msg.username + " with id " + playerId + " set");

        next(null, {code: "OK", payload: playerId});
    }

});
