/**
 * Socket.IO client connection.
 * ----------------------------
 * A single shared connection to the backend WebSocket server. Components
 * import this one instance instead of each creating their own.
 */

import { io } from 'socket.io-client';

// Matches the backend server URL (same host/port as the REST API)
const SOCKET_URL = 'http://localhost:3000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;