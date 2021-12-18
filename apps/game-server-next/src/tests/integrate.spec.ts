import { SocketHandler } from '../app/SocketHandler';
import { GameServerClient } from '../app/client/client';

describe('Integration of Game Server and Client', () => {
  const socketHandler = new SocketHandler();
  socketHandler.start(10000);

  it('Register/Login round trip', async () => {
    const client = new GameServerClient();
    const response = await client.call({
      handler: 'auth',
      method: '',
      payload: { playerName: 'Foobar' },
    });
    expect(response.status).toEqual('ok');
  });
});
