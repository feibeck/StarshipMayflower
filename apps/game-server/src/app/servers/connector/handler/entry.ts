export default function (app) {
  return new Handler(app);
}

let id = 1;

class Handler {
  private serverId: string;
  constructor(private app) {
    this.serverId = app.get('serverId').split('-')[2];
  }

  entry(msg, session, next) {
    const playerId = parseInt(this.serverId + id, 10);
    id += 1;
    session.bind(playerId);
    session.set('playerId', playerId);
    session.set('playername', msg.username);
    session.on('closed', (app, session, reason) => {
      if (session && session.uid) {
        app.rpc.world.player.playerLeave(
          session,
          { playerId: session.get('playerId') },
          null
        );
      }
    });
    session.pushAll();

    console.log(
      'Session for player ' + msg.username + ' with id ' + playerId + ' set'
    );

    next(null, { code: 'OK', payload: playerId });
  }

  view(_msg, session, next) {
    const viewerId = parseInt(this.serverId + id, 10);
    id += 1;
    session.bind(viewerId);
    session.set('viewerId', viewerId);
    session.pushAll();

    next(null, { code: 'OK', payload: viewerId });
  }
}
