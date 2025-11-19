// apps/api/scripts/ws-smoke.js
// Purpose: quick WS smoke test for "book" snapshots.
const { io } = require('socket.io-client');

const URL = 'http://127.0.0.1:3001';
const SYMBOL = 'WETH-USDC';

const socket = io(URL, {
  path: '/socket.io', // force WS, avoid polling noise
});

socket.on('connect', () => {
  console.log('[ws] connected', socket.id);
  socket.emit('book:subscribe', { symbol: SYMBOL });
});

socket.on('book:ack', (ack) => {
  console.log('[ws] ack', ack);
});

socket.on('book', (payload) => {
  const bids = Array.isArray(payload?.bids) ? payload.bids.length : 0;
  const asks = Array.isArray(payload?.asks) ? payload.asks.length : 0;
  console.log(
    '[ws] book',
    payload.symbol,
    payload.ts,
    'bids',
    bids,
    'asks',
    asks,
  );
});

// Graceful exit after a few seconds
setTimeout(() => {
  socket.emit('book:unsubscribe', { symbol: SYMBOL });
  socket.close();
  console.log('[ws] closed');
}, 5000);

socket.on('connect_error', (e) => console.error('[ws] connect_error', e));
socket.on('error', (e) => console.error('[ws] error', e));
