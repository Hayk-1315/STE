// Simple Socket.IO smoke for orders.{address}
const { io } = require('socket.io-client');
const ADDR =
  process.env.TEST_ADDR?.toLowerCase() ||
  '0xf607b5289f1fe7b4b4b770024344b4f1e4ea2f29';

const s = io('http://127.0.0.1:3001', { transports: ['websocket'] });

s.on('connect', () => {
  console.log('[ws] connected', s.id);
  s.emit('orders:subscribe', { address: ADDR });
});

s.on('orders:subscribed', (m) => console.log('[ws] subscribed', m));
s.on('orders:event', (e) => console.log('[ws] event', e));
s.on('disconnect', () => console.log('[ws] disconnected'));
s.on('connect_error', (e) =>
  console.log('[ws] connect_error', e?.message || e),
);

//setTimeout(() => { console.log('[ws] bye'); s.close(); }, 30000);
