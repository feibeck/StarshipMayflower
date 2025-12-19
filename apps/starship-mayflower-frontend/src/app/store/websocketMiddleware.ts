import { GameServerClient } from './client';
import { Middleware, MiddlewareAPI, UnknownAction } from 'redux';
import { RootState } from './store';
import { connected, connectionError } from './game.slice';

interface WsConnectAction extends UnknownAction {
  type: 'WS_CONNECT';
}

interface WsDisconnectAction extends UnknownAction {
  type: 'WS_DISCONNECT';
}

interface NewMessageAction extends UnknownAction {
  type: 'NEW_MESSAGE';
  msg: Record<string, unknown>;
}

type WebSocketAction = WsConnectAction | WsDisconnectAction | NewMessageAction | UnknownAction;

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
  // Type guard to check if action has a type property
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const typedAction = action as WebSocketAction;

    switch (typedAction.type) {
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
        return;
      case 'WS_DISCONNECT':
        if (client !== null) {
          //client.close();
        }
        client = null;
        console.log('client closed');
        return;
      case 'NEW_MESSAGE': {
        const messageAction = typedAction as NewMessageAction;
        console.log('sending a message', messageAction.msg);
        client?.call(messageAction.msg).then((response) => {
          storeApi.dispatch({ type: 'foo', payload: response });
        });
        return;
      }
    }
  }

  return next(action);
};
