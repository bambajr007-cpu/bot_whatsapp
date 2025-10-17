import chalk from 'chalk';
import moment from 'moment-timezone';
import fs from 'fs-extra';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
await fs.ensureDir(logsDir);

const getTimestamp = () => {
  return moment().tz('Africa/Abidjan').format('HH:mm:ss');
};

const getDate = () => {
  return moment().tz('Africa/Abidjan').format('YYYY-MM-DD');
};

const writeToFile = async (level, message) => {
  try {
    const logFile = path.join(logsDir, `${getDate()}.log`);
    const logLine = `[${getTimestamp()}] [${level}] ${message}\n`;
    await fs.appendFile(logFile, logLine);
  } catch (error) {
    // Ignore si erreur d'écriture
  }
};

export const log = {
  info: async (...args) => {
    const msg = args.join(' ');
    console.log(chalk.blue(`[${getTimestamp()}] ℹ️`), msg);
    await writeToFile('INFO', msg);
  },
  
  success: async (...args) => {
    const msg = args.join(' ');
    console.log(chalk.green(`[${getTimestamp()}] ✅`), msg);
    await writeToFile('SUCCESS', msg);
  },
  
  warn: async (...args) => {
    const msg = args.join(' ');
    console.log(chalk.yellow(`[${getTimestamp()}] ⚠️`), msg);
    await writeToFile('WARN', msg);
  },
  
  error: async (...args) => {
    const msg = args.join(' ');
    console.log(chalk.red(`[${getTimestamp()}] ❌`), msg);
    await writeToFile('ERROR', msg);
  },
  
  cmd: async (command, from) => {
    const msg = `Commande: ${command} de ${from}`;
    console.log(
      chalk.magenta(`[${getTimestamp()}] 📝`),
      chalk.cyan(command),
      chalk.gray('de'),
      chalk.white(from)
    );
    await writeToFile('CMD', msg);
  },
  
  debug: async (...args) => {
    const msg = args.join(' ');
    console.log(chalk.gray(`[${getTimestamp()}] 🐛`), msg);
    await writeToFile('DEBUG', msg);
  },
  
  box: (lines) => {
    const maxLength = Math.max(...lines.map(l => l.replace(/\u001b\[[0-9;]*m/g, '').length));
    const border = '═'.repeat(maxLength + 4);
    
    console.log(chalk.cyan('╔' + border + '╗'));
    lines.forEach(line => {
      const cleanLine = line.replace(/\u001b\[[0-9;]*m/g, '');
      const padding = ' '.repeat(maxLength - cleanLine.length);
      console.log(chalk.cyan('║  ') + line + padding + chalk.cyan('  ║'));
    });
    console.log(chalk.cyan('╚' + border + '╝'));
  }
};
