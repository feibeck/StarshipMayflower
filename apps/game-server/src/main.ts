import { pinus } from 'pinus';
import 'reflect-metadata';

/**
 * Init app for client.
 */
const app = pinus.createApp({ base: __dirname });
app.set('name', 'Starship Mayflower');

// app configuration
app.configure('production|development', 'connector', function () {
  app.set('connectorConfig', {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true,
  });
});

// start app
app.start();
