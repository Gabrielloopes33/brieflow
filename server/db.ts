import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import Database from "better-sqlite3";
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./data/briefflow.db');

// Ensure data directory exists
const dataDir = path.dirname(databasePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(databasePath);
export const db = drizzle(sqlite, { schema });