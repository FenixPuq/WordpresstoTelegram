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

// Ensure data directory exists
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read config from file
export function readConfig(): Config {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { ...defaultConfig };
  } catch (error) {
    console.error('Error reading config:', error);
    return { ...defaultConfig };
  }
}

// Write config to file
export function writeConfig(config: Partial<Config>): Config {
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
  } catch (error) {
    console.error('Error writing config:', error);
    throw error;
  }
}

// Mask token for security (show only last 4 characters)
export function maskToken(token: string): string {
  if (!token || token.length <= 4) {
    return '****';
  }
  return '****' + token.slice(-4);
}

// Add post to history
export function addToHistory(post: Omit<PostHistory, 'id' | 'sentAt'>): void {
  try {
    const config = readConfig();
    const newPost: PostHistory = {
      ...post,
      id: generateId(),
      sentAt: new Date().toISOString(),
    };
    
    // Keep only last 50 posts
    config.history = [newPost, ...config.history].slice(0, 50);
    writeConfig(config);
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

// Get last N posts from history
export function getHistory(limit: number = 5): PostHistory[] {
  const config = readConfig();
  return config.history.slice(0, limit);
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Check if config is valid
export function isConfigured(): boolean {
  const config = readConfig();
  return !!(config.botToken && config.chatId);
}
