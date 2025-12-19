/**
 * @deprecated Use GameClient from '../services/GameClient' instead
 * This file is kept for backward compatibility during migration
 */

import { GameClient, gameClient } from '../services/GameClient';

// Re-export for backward compatibility
export { GameClient as GameServerClient };
export default gameClient;
