import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export interface PostHistory {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  imageUrl?: string;
  sentAt: string;
  success: boolean;
}

export interface Config {
  botToken: string;
  chatId: string;
  history: PostHistory[];
  createdAt?: string;
  updatedAt?: string;
}

const defaultConfig: Config = {
  botToken: '',
  chatId: '',
  history: [],
};

let memoryHistory: PostHistory[] = [];

function isProduction(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readConfig(): Config {
  if (isProduction()) {
    return {
      botToken: process.env.BOT_TOKEN || '',
      chatId: process.env.CHAT_ID || '',
      history: memoryHistory,
    };
  }

  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { ...defaultConfig };
  } catch {
    return { ...defaultConfig };
  }
}

export function writeConfig(config: Partial<Config>): Config {
  if (isProduction()) {
    throw new Error('En produccion use variables de entorno');
  }

  try {
    ensureDataDir();
    const currentConfig = readConfig();
    const newConfig: Config = {
      ...currentConfig,
      ...config,
      updatedAt: new Date().toISOString(),
    };

    if (!currentConfig.createdAt) {
      newConfig.createdAt = new Date().toISOString();
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch {
    throw new Error('Error al guardar');
  }
}

export function maskToken(token: string): string {
  if (!token || token.length <= 4) {
    return '****';
