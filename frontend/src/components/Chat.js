/**
 * Chat Component — Live real-time chat.
 * -------------------------------------
 * - Loads past messages from the REST API (GET /api/messages) on mount.
 * - Connects via Socket.IO and listens for three custom events:
 *     chat:message  -> append a new message (from anyone, including self)
 *     chat:typing   -> show "X is typing…" (auto-clears after 2s)
 *     chat:join     -> show "X joined the chat" briefly
 * - Sends chat:message and chat:typing / chat:join to the server.
 */

import { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import apiClient from '../services/apiClient';
import { useAuth } from '../services/AuthContext';

export default function Chat() {
  const { currentUser } = useAuth();
  const senderName = currentUser ? currentUser.firstName : 'Guest';

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [joinNotice, setJoinNotice] = useState('');
  const listRef = useRef(null);
  const typingTimeout = useRef(null);

  // Load history once, then announce we joined.
  useEffect(() => {
    apiClient
      .get('/messages')
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([]));

    socket.emit('chat:join', { sender: senderName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wire up socket listeners. Clean them up on unmount to avoid duplicates.
  useEffect(() => {
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);

    const onTyping = ({ sender }) => {
      setTypingUser(sender);
      // auto-clear the indicator after 2 seconds of no new typing events
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTypingUser(''), 2000);
    };

    const onJoin = ({ sender }) => {
      setJoinNotice(`${sender} joined the chat`);
      setTimeout(() => setJoinNotice(''), 6000);
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:join', onJoin);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:join', onJoin);
    };
  }, []);

  // Auto-scroll only the message box (not the whole page) when messages change.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function handleType(e) {
    setText(e.target.value);
    socket.emit('chat:typing', { sender: senderName }); // notify others
  }

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit('chat:message', {
      sender: senderName,
      text: trimmed,
      userId: currentUser?.userId || null,
    });
    setText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') sendMessage();
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col h-96">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Live Chat</h2>

      {/* Join notice */}
      {joinNotice && (
        <div className="text-xs text-green-600 mb-1">{joinNotice}</div>
      )}

      {/* Message list */}
      <div ref={listRef} className="flex-1 overflow-y-auto border border-gray-100 rounded p-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-4">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div key={m.messageId || m.id} className="text-sm">
              <span className="font-semibold text-gray-700">{m.sender}: </span>
              <span className="text-gray-600">{m.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Typing indicator */}
      <div className="h-5 text-xs text-gray-400 italic">
        {typingUser ? `${typingUser} is typing…` : ''}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={text}
          onChange={handleType}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          onClick={sendMessage}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}