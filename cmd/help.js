export default {
  name: 'help',
  description: 'Liste des commandes',
  
  execute: async (sock, message) => {
    const { from } = message;
    
    const commands = Array.from(global.commands?.values() || []);
    
    let text = '📋 *Commandes Disponibles*\n\n';
    
    commands.forEach(cmd => {
      text += `▪️ .${cmd.name} - ${cmd.description}\n`;
    });
    
    await sock.sendMessage(from, { text });
  }
};
