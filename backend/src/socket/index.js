/**
 * Socket.IO setup — Live Chat feature.
 * ------------------------------------
 * One real-time feature (chat) with three custom events, plus the built-in
 * connect/disconnect. Messages are persisted to MySQL via the Message model;
 * chat history is loaded separately through GET /api/messages.
 *
 * Custom events:
 *   - chat:message (client -> server -> ALL clients): save to DB, then broadcast
 *   - chat:typing  (client -> server -> OTHER clients): "user is typing…"
 *   - chat:join    (client -> server -> OTHER clients): "user joined the chat"
 */

const { Server } = require('socket.io');
const { Message } = require('../../models');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*' },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // EVENT 3: a client announces they joined -> tell the OTHER clients
    socket.on('chat:join', (data) => {
      socket.broadcast.emit('chat:join', { sender: data.sender || 'Someone' });
    });

    // EVENT 1: a client sent a message -> persist to MySQL, then broadcast to ALL
    socket.on('chat:message', async (data) => {
      try {
        const saved = await Message.create({
          sender: data.sender || 'Anonymous',
          text: String(data.text || '').slice(0, 500),
          userId: data.userId || null,
        });
        io.emit('chat:message', saved); // broadcast the saved row (has id + timestamp)
      } catch (err) {
        console.error('Failed to save chat message:', err.message);
        // Tell just this sender that it failed
        socket.emit('chat:error', { message: 'Message could not be sent.' });
      }
    });

    // EVENT 2: a client is typing -> notify the OTHER clients only
    socket.on('chat:typing', (data) => {
      socket.broadcast.emit('chat:typing', { sender: data.sender || 'Someone' });
    });

    // Built-in disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Called by the REST controller after an admin clears chat history,
// so all connected clients empty their chat in real time.
function broadcastChatCleared() {
  if (io) io.emit('chat:cleared');
}

module.exports = { initSocket, broadcastChatCleared };