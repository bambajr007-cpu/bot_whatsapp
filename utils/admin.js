import fs from 'fs-extra';
import path from 'path';
import config from '../config.js';
import { log } from './logger.js';

class AdminManager {
  constructor() {
    this.adminsFile = config.adminsFile;
    this.admins = [];
    this.init();
  }
  
  // Charge les admins au démarrage
  async init() {
    try {
      await fs.ensureDir(path.dirname(this.adminsFile));
      
      if (await fs.pathExists(this.adminsFile)) {
        const data = await fs.readJson(this.adminsFile);
        this.admins = data.admins || [];
        log.success(`${this.admins.length} admin(s) chargé(s)`);
      } else {
        await this.save();
        log.info('Fichier admins.json créé');
      }
    } catch (error) {
      log.error(`Erreur init admins: ${error.message}`);
      this.admins = [];
    }
  }
  
  // Normalise un UID pour la comparaison
  normalizeUID(uid) {
    if (!uid) return '';
    const parts = uid.split('@');
    return parts[0];
  }
  
  // Vérifie si c'est le propriétaire
  isOwner(uid) {
    const normalized = this.normalizeUID(uid);
    const owner = this.normalizeUID(config.owner);
    return normalized === owner;
  }
  
  // Vérifie si c'est un admin (ou owner)
  isAdmin(uid) {
    if (this.isOwner(uid)) return true;
    
    const normalized = this.normalizeUID(uid);
    return this.admins.some(admin => {
      return this.normalizeUID(admin) === normalized;
    });
  }
  
  // Ajoute un admin
  async addAdmin(uid) {
    if (this.isAdmin(uid)) {
      return { success: false, message: 'Déjà admin' };
    }
    
    const formatted = uid.includes('@') ? uid : `${uid}@s.whatsapp.net`;
    this.admins.push(formatted);
    await this.save();
    
    log.success(`Admin ajouté: ${formatted}`);
    return { success: true, message: 'Admin ajouté avec succès' };
  }
  
  // Retire un admin
  async removeAdmin(uid) {
    if (this.isOwner(uid)) {
      return { success: false, message: 'Impossible de retirer le propriétaire' };
    }
    
    const normalized = this.normalizeUID(uid);
    const initialLength = this.admins.length;
    
    this.admins = this.admins.filter(admin => {
      return this.normalizeUID(admin) !== normalized;
    });
    
    if (this.admins.length === initialLength) {
      return { success: false, message: 'Admin non trouvé' };
    }
    
    await this.save();
    log.success(`Admin retiré: ${uid}`);
    return { success: true, message: 'Admin retiré avec succès' };
  }
  
  // Liste tous les admins
  listAdmins() {
    return [...this.admins];
  }
  
  // Sauvegarde dans admins.json
  async save() {
    try {
      await fs.writeJson(this.adminsFile, {
        admins: this.admins,
        lastUpdated: new Date().toISOString()
      }, { spaces: 2 });
    } catch (error) {
      log.error(`Erreur sauvegarde admins: ${error.message}`);
    }
  }
}

export const adminManager = new AdminManager();
