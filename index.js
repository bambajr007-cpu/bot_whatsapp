import makeWASocket, { 
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import express from 'express';

// CONFIG SIMPLE
const config = {
  botNumber: process.env.BOT_NUMBER || '2250502187623',
  owner: process.env.OWNER_UID || '2250566514363@s.whatsapp.net',
  prefix: '.',
  port: process.env.PORT || 3000
};

// VARIABLES GLOBALES
let sock;
let isPairingRequested = false;
const msgRetryCounterCache = new Map();
const commands = new Map();

// LOGGER SIMPLE
const log = {
  info: (msg) => console.log([INFO] ${msg}),
  success: (msg) => console.log([✅] ${msg}),
  warn: (msg) => console.log([⚠] ${msg}),
  error: (msg) => console.log([❌] ${msg})
};

// CHARGER COMMANDES
async function loadCommands() {
  const cmdDir = path.join(process.cwd(), 'cmd');
  await fs.ensureDir(cmdDir);
  
  const files = (await fs.readdir(cmdDir)).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    try {
      const cmd = await import(./cmd/${file});
      const command = cmd.default || cmd;
      
      if (command.name && command.execute) {
        commands.set(command.name, command);
        log.success(Chargé: ${file});
      }
    } catch (error) {
      log.error(Erreur ${file}: ${error.message});
    }
  }
  
  log.success(${commands.size} commandes chargées);
}

// TRAITER MESSAGES
async function handleMessages(sock, m) {
  const msg = m.messages[0];
  if (!msg.message || msg.key.fromMe) return;
  
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  if (!text.startsWith(config.prefix)) return;
  
  const args = text.slice(config.prefix.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();
  
  const command = commands.get(cmdName);
  if (!command) return;
  
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || from;
  
  log.info(Commande: ${cmdName} de ${sender});
  
  try {
    await command.execute(sock, { from, sender, body: text }, args);
  } catch (error) {
    log.error(Erreur commande ${cmdName}: ${error.message});
    await sock.sendMessage(from, { text: '❌ Erreur' });
  }
}

// DÉMARRER BOT
async function startBot() {
  await fs.ensureDir('./session');
  await fs.ensureDir('./data');
  
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();
  
  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: undefined,
    maxMsgRetryCount: 3,
    msgRetryCounterCache,
    getMessage: async (key) => {
      return msgRetryCounterCache.get(key.id) || undefined;
    }
  });
  
  // PAIRING CODE
  if (!sock.authState.creds.registered && !isPairingRequested) {
    isPairingRequested = true;
    const phoneNumber = config.botNumber.replace(/[^0-9]/g, '');
    
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        log.success(CODE: ${code});
        log.info(Ouvre: http://localhost:${config.port}/pair);
        
        setTimeout(() => {
          if (!sock.user) {
            isPairingRequested = false;
          }
        }, 60000);
      } catch (err) {
        log.error(Pairing: ${err.message});
        isPairingRequested = false;
      }
    }, 3000);
  }
  
  // ÉVÉNEMENTS
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      
      if (code === DisconnectReason.loggedOut) {
        log.error('Déconnecté');
        process.exit(0);
      } else {
        log.warn('Reconnexion...');
        await delay(5000);
        startBot();
      }
    }
    
    if (connection === 'open') {
      log.success('Bot connecté!');
      await sock.sendMessage(config.owner, { text: '✅ Bot en ligne' });
    }
  });
  
  sock.ev.on('messages.upsert', async (m) => {
    if (m.messages) {
      for (const msg of m.messages) {
        if (msg.key?.id) {
          msgRetryCounterCache.set(msg.key.id, msg);
          setTimeout(() => msgRetryCounterCache.delete(msg.key.id), 300000);
        }
      }
    }
    await handleMessages(sock, m);
  });
}

// SERVEUR WEB
function startWebServer() {
  const app = express();
  
  app.get('/', (req, res) => {
    res.send('<h1>Bot Online</h1>');
  });
  
  app.get('/health', (req, res) => {
    res.json({ status: sock?.user ? 'online' : 'offline' });
  });
  
  app.listen(config.port, () => {
    log.success(Serveur: http://localhost:${config.port});
  });
}

// INIT
(async () => {
  log.info('Démarrage du bot...');
  await loadCommands();
  startWebServer();
  await startBot();
})();
