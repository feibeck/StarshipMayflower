import {
  SocketHandler,
  Game,
  LobbyHandler,
  NavigationHandler,
  GameHandler,
  AuthHandler,
} from '@starship-mayflower/game-server-lib';

// Initialize socket handler
const handler = new SocketHandler();

// Initialize game instance with the handler's channel
const game = new Game(handler.channel);

// Register game handlers
handler.router.addHandler(new AuthHandler(game));
handler.router.addHandler(new LobbyHandler(game));
handler.router.addHandler(new NavigationHandler(game));
handler.router.addHandler(new GameHandler(game));

// Start server
handler.start(10000);

console.log('Game Server Next started on port 10000');
console.log('Handlers registered: lobby, navigation, game, auth');
