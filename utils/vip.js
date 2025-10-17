import fs from 'fs-extra';
import path from 'path';
import config from '../config.js';
import { log } from './logger.js';

class VipManager {
  constructor() {
    this.vipFile = config.vipFile;
    this.vipUsers = [];
    this.init();
  }
  
  // Charge les VIP au démarrage
  async init() {
    try {
      await fs.ensureDir(path.dirname(this.vipFile));
      
      if (await fs.pathExists(this.vipFile)) {
        const data = await fs.readJson(this.vipFile);
        
        if (Array.isArray(data)) {
          this.vipUsers = data;
        } else if (data.users && Array.isArray(data.users)) {
          this.vipUsers = data.users;
        }
        
        log.success(`${this.vipUsers.length} VIP(s) chargé(s)`);
      } else {
        await this.save();
        log.info('Fichier vip_users.json créé');
      }
    } catch (error) {
      log.error(`Erreur init VIP: ${error.message}`);
      this.vipUsers = [];
      await this.save();
    }
  }
  
  // Normalise un UID
  normalizeUID(uid) {
    if (!uid) return '';
    const parts = uid.split('@');
    return parts[0];
  }
  
  // Vérifie si c'est un VIP
  isVip(uid) {
    const normalized = this.normalizeUID(uid);
    return this.vipUsers.some(vip => {
      return this.normalizeUID(vip) === normalized;
    });
  }
  
  // Ajoute un VIP
  async addVip(uid) {
    if (this.isVip(uid)) {
      return { success: false, message: 'Déjà VIP' };
    }
    
    const formatted = uid.includes('@') ? uid : `${uid}@s.whatsapp.net`;
    this.vipUsers.push(formatted);
    await this.save();
    
    log.success(`VIP ajouté: ${formatted}`);
    return { success: true, message: 'VIP ajouté avec succès' };
  }
  
  // Retire un VIP
  async removeVip(uid) {
    const normalized = this.normalizeUID(uid);
    const initialLength = this.vipUsers.length;
    
    this.vipUsers = this.vipUsers.filter(vip => {
      return this.normalizeUID(vip) !== normalized;
    });
    
    if (this.vipUsers.length === initialLength) {
      return { success: false, message: 'VIP non trouvé' };
    }
    
    await this.save();
    log.success(`VIP retiré: ${uid}`);
    return { success: true, message: 'VIP retiré avec succès' };
  }
  
  // Liste tous les VIP
  listVips() {
    return [...this.vipUsers];
  }
  
  // Sauvegarde dans vip_users.json
  async save() {
    try {
      await fs.writeJson(this.vipFile, {
        users: this.vipUsers,
        lastUpdated: new Date().toISOString()
      }, { spaces: 2 });
    } catch (error) {
      log.error(`Erreur sauvegarde VIP: ${error.message}`);
    }
  }
}

export const vipManager = new VipManager();
