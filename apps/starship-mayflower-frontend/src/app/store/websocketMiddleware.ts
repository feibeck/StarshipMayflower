import { GameServerClient } from './client';
import { Middleware, MiddlewareAPI } from 'redux';
import { RootState } from './store';
import { connected, connectionError } from './game.slice';

let client: GameServerClient | null = null;

const onOpen = (storeApi: MiddlewareAPI) => () => {
  storeApi.dispatch(connected());
};
const onConnectionError = (storeApi: MiddlewareAPI) => () => {
  storeApi.dispatch(connectionError());
};

/*const onClose = (storeApi: MiddlewareAPI) => () => {
  storeApi.dispatch(actions.wsDisconnected());
};*/

const onMessage =
  (storeApi: MiddlewareAPI) => (msg: Record<string, unknown>) => {
    storeApi.dispatch({ type: 'foo', payload: msg });
  };

export const GameMiddleware: Middleware<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}, // Most middleware do not modify the dispatch return value
  RootState
> = (storeApi) => (next) => (action) => {
  switch (action.type) {
    case 'WS_CONNECT':
      if (client !== null) {
        //client.close();
      }

      client = new GameServerClient();
      client.connect();
      client.on('open', onOpen(storeApi));
      client.on('connectionError', onConnectionError(storeApi));
      // client.onConnect(onOpen(storeApi));
      // client.onClose(onClose(storeApi));
      client.on('message', onMessage(storeApi));
      break;
    case 'WS_DISCONNECT':
      if (client !== null) {
        //client.close();
      }
      client = null;
      console.log('client closed');
      break;
    case 'NEW_MESSAGE':
      console.log('sending a message', action.msg);
      client?.call(action.msg).then((response) => {
        storeApi.dispatch({ type: 'foo', payload: response });
      });
      break;
    default:
      return next(action);
  }
};
