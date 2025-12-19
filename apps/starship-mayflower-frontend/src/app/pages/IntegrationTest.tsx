import { useEffect, useState } from 'react';
import { gameClient } from '../services/GameClient';

/**
 * Integration Test Page
 * Tests WebSocket connection and basic handler functionality
 */
export function IntegrationTest() {
  const [status, setStatus] = useState<string>('Not connected');
  const [events, setEvents] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('TestUser');

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${event}`]);
  };

  useEffect(() => {
    // Setup event listeners
    gameClient.on('connected', () => {
      setStatus('Connected');
      addEvent('✅ Connected to server');
    });

    gameClient.on('disconnected', () => {
      setStatus('Disconnected');
      addEvent('❌ Disconnected from server');
    });

    gameClient.on('connectionError', (error) => {
      setStatus('Connection Error');
      addEvent(`❌ Connection error: ${JSON.stringify(error)}`);
    });

    gameClient.on('reconnecting', (attempt: number) => {
      addEvent(`🔄 Reconnecting... (attempt ${attempt})`);
    });

    // Connect
    gameClient
      .connect()
      .then(() => {
        addEvent('✅ Connection established');
      })
      .catch((err) => {
        addEvent(`❌ Connection failed: ${err.message}`);
      });

    return () => {
      // Cleanup
      gameClient.off('connected', () => {});
      gameClient.off('disconnected', () => {});
      gameClient.off('connectionError', () => {});
      gameClient.off('reconnecting', () => {});
    };
  }, []);

  const handleLogin = async () => {
    try {
      addEvent(`🔐 Attempting login as "${username}"...`);
      const response = await gameClient.login(username);
      addEvent(`✅ Login response: ${JSON.stringify(response)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addEvent(`❌ Login error: ${error.message}`);
      } else {
        addEvent(`❌ Login error: ${String(error)}`);
      }
    }
  };

  const handleListShips = async () => {
    try {
      addEvent('🚀 Fetching ship list...');
      const response = await gameClient.listAvailableShips();
      addEvent(`✅ Ships response: ${JSON.stringify(response, null, 2)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addEvent(`❌ List ships error: ${error.message}`);
      } else {
        addEvent(`❌ List ships error: ${String(error)}`);
      }
    }
  };

  const handleCreateShip = async () => {
    try {
      const shipName = 'USS Test';
      addEvent(`🚀 Creating ship "${shipName}"...`);
      const response = await gameClient.addNewShip(shipName);
      addEvent(`✅ Create ship response: ${JSON.stringify(response, null, 2)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        addEvent(`❌ Create ship error: ${error.message}`);
      } else {
        addEvent(`❌ Create ship error: ${String(error)}`);
      }
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Integration Test</h1>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Status:</strong> <span style={{ color: status === 'Connected' ? 'green' : 'red' }}>{status}</span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Actions</h2>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
          />
          <button
            onClick={handleLogin}
            disabled={status !== 'Connected'}
            style={{ padding: '8px 16px', marginRight: '10px', cursor: status === 'Connected' ? 'pointer' : 'not-allowed' }}
          >
            🔐 Login
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={handleListShips}
            disabled={status !== 'Connected'}
            style={{ padding: '8px 16px', marginRight: '10px', cursor: status === 'Connected' ? 'pointer' : 'not-allowed' }}
          >
            📋 List Ships
          </button>
          <button
            onClick={handleCreateShip}
            disabled={status !== 'Connected'}
            style={{ padding: '8px 16px', cursor: status === 'Connected' ? 'pointer' : 'not-allowed' }}
          >
            ➕ Create Ship
          </button>
        </div>

        <div>
          <button
            onClick={clearEvents}
            style={{ padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🗑️ Clear Log
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Event Log</h2>
        <div
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '15px',
            borderRadius: '5px',
            maxHeight: '500px',
            overflowY: 'auto',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          {events.length === 0 ? (
            <div style={{ color: '#888' }}>No events yet...</div>
          ) : (
            events.map((event, index) => (
              <div key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
        <h3>ℹ️ Info</h3>
        <p><strong>Server:</strong> ws://localhost:10000</p>
        <p><strong>Handlers Available:</strong> auth, lobby, navigation, game</p>
        <p><strong>Test Sequence:</strong></p>
        <ol>
          <li>Wait for connection (should auto-connect)</li>
          <li>Click "Login" to authenticate</li>
          <li>Click "List Ships" to see available ships</li>
          <li>Click "Create Ship" to add a new ship</li>
        </ol>
      </div>
    </div>
  );
}
