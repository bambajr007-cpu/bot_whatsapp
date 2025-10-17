import config from '../config.js';

export const helper = {
  // Extrait le numéro d'un JID
  extractNumber: (jid) => {
    if (!jid) return '';
    return jid.split('@')[0];
  },
  
  // Crée un UID complet
  getUID: (jid) => {
    if (!jid) return '';
    return jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
  },
  
  // Vérifie si c'est le propriétaire
  isOwner: (jid) => {
    const normalized = helper.extractNumber(jid);
    const owner = helper.extractNumber(config.owner);
    return normalized === owner;
  },
  
  // Parse une commande
  parseCommand: (text) => {
    if (!text || !text.startsWith(config.prefix)) return null;
    
    const args = text.slice(config.prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    
    return { command, args };
  },
  
  // Attend X millisecondes
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  // Format une durée en secondes
  formatDuration: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    let result = [];
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}m`);
    if (secs > 0 || result.length === 0) result.push(`${secs}s`);
    
    return result.join(' ');
  },
  
  // Format un timestamp
  formatTime: (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', { 
      timeZone: 'Africa/Abidjan',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },
  
  // Valide un numéro de téléphone
  isValidPhone: (phone) => {
    return /^[0-9]{10,15}$/.test(phone.replace(/[^0-9]/g, ''));
  },
  
  // Nettoie un texte
  cleanText: (text) => {
    return text.trim().replace(/\s+/g, ' ');
  },
  
  // Tronque un texte
  truncate: (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  // Échappe les caractères spéciaux Markdown
  escapeMarkdown: (text) => {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
  }
};
