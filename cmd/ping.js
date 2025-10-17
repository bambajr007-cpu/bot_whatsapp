export default {
  name: 'ping',
  description: 'Test de latence',
  
  execute: async (sock, message) => {
    const { from } = message;
    const start = Date.now();
    
    await sock.sendMessage(from, { text: '🏓 Pong!' });
    
    const latency = Date.now() - start;
    await sock.sendMessage(from, { text: `⏱️ ${latency}ms` });
  }
};
