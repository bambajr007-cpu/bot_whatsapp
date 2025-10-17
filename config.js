import dotenv from 'dotenv';
dotenv.config();

export default {
  // BOT
  botNumber: process.env.BOT_NUMBER || '2250566514363',
  botName: process.env.BOT_NAME || 'EKIP',
  botVersion: '1.0.0',
  creator: 'Ben',
  prefix: process.env.PREFIX || '!',
  
  // SERVEUR
  port: process.env.PORT || 3000,
  webUrl: process.env.WEB_URL || `http://localhost:${process.env.PORT || 3000}`,
  
  // CONNEXION
  usePairingCode: process.env.USE_PAIRING_CODE === 'true' || true,
  mobileMode: process.env.MOBILE_MODE === 'true' || false,
  
  // PROPRIÉTAIRE
  owner: process.env.OWNER_UID || '2250502187623@s.whatsapp.net',
  
  // CHEMINS
  sessionPath: './session',
  commandsPath: './cmd',
  dataPath: './data',
  adminsFile: './data/admins.json',
  vipFile: './data/vip_users.json',
  
  // DEBUG
  debug: process.env.DEBUG === 'true' || false,
  
  // MESSAGES
  messages: {
    welcome: '✅ *EKIP* connecté avec succès!',
    error: '❌ Une erreur est survenue',
    notOwner: '🚫 Cette commande est réservée au propriétaire',
    notAdmin: '🚫 Cette commande nécessite les droits administrateur',
    notVip: '🚫 Cette commande est réservée aux membres VIP',
    invalidUsage: '❌ Utilisation incorrecte. Utilise: ',
    processing: '⏳ Traitement en cours...',
    success: '✅ Opération réussie!',
    failed: '❌ Opération échouée'
  },
  
  // LIMITES
  maxCommandRetries: 3,
  commandTimeout: 30000,
  maxMessageLength: 65536
};
