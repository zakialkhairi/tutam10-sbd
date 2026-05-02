import fs from 'fs';
import path from 'path';
import { Workspace } from '@/types';

// In-memory fallback if file system is not accessible (e.g. some serverless envs)
let memoryStore: Workspace[] = [];

const dbPath = path.join(process.cwd(), 'data', 'db.json');

const ensureDbExists = () => {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([]));
    }
  } catch (error) {
    console.warn("Could not access file system for DB. Falling back to in-memory storage.");
  }
};

export const getWorkspaces = (): Workspace[] => {
  try {
    ensureDbExists();
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return memoryStore;
  }
};

export const saveWorkspaces = (workspaces: Workspace[]) => {
  try {
    ensureDbExists();
    fs.writeFileSync(dbPath, JSON.stringify(workspaces, null, 2));
  } catch (error) {
    memoryStore = workspaces;
  }
};
