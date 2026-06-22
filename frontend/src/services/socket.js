/**
 * Socket.IO client connection.
 * ----------------------------
 * A single shared connection to the backend WebSocket server. Components
 * import this one instance instead of each creating their own.
 */

import { io } from 'socket.io-client';

// Same origin as the page in production (Express serves both app + socket).
// In local dev (Parcel on 5173) connect to the backend on localhost:3000.
const isLocalDev =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const SOCKET_URL = isLocalDev ? 'http://localhost:3000' : window.location.origin;

const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;