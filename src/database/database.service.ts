import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';

export interface AdminEntity {
  id: number;
  username: string;
  password?: string;
  name: string;
  role: string;
  refreshToken?: string | null;
  createdAt: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: Database.Database;
  private dbPath!: string;

  constructor(@Optional() private readonly configService?: ConfigService) {}

  onModuleInit(): void {
    const dbFileName =
      this.configService?.get<string>('DATABASE_PATH') ||
      process.env.DATABASE_PATH ||
      'database.sqlite';
    this.dbPath = path.resolve(process.cwd(), dbFileName);
    this.db = new Database(this.dbPath);
    this.logger.log(`SQLite database connected: ${this.dbPath}`);
    this.initTables();
    this.seedDefaultAdmin();
  }

  onModuleDestroy(): void {
    if (this.db) {
      this.db.close();
      this.logger.log('SQLite database connection closed');
    }
  }

  getDb(): Database.Database {
    return this.db;
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        refreshToken TEXT,
        createdAt TEXT NOT NULL
      );
    `);

    try {
      this.db.exec('ALTER TABLE admins ADD COLUMN refreshToken TEXT;');
    } catch {
      // Column already exists, ignore
    }
  }

  private seedDefaultAdmin(): void {
    const defaultUsername =
      this.configService?.get<string>('DEFAULT_ADMIN_USERNAME') ||
      process.env.DEFAULT_ADMIN_USERNAME ||
      'admin';
    const existing = this.findAdminByUsername(defaultUsername);
    if (!existing) {
      const defaultPassword =
        this.configService?.get<string>('DEFAULT_ADMIN_PASSWORD') ||
        process.env.DEFAULT_ADMIN_PASSWORD ||
        'admin1234';
      const name =
        this.configService?.get<string>('DEFAULT_ADMIN_NAME') ||
        process.env.DEFAULT_ADMIN_NAME ||
        'ผู้ดูแลระบบ (Admin)';
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      const role = 'admin';
      const createdAt = new Date().toISOString();

      const stmt = this.db.prepare(`
        INSERT INTO admins (username, password, name, role, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(defaultUsername, hashedPassword, name, role, createdAt);

      this.logger.log(
        `Default admin account created: username='${defaultUsername}', password='${defaultPassword}'`,
      );
    }
  }

  findAdminByUsername(username: string): AdminEntity | undefined {
    const stmt = this.db.prepare('SELECT * FROM admins WHERE username = ?');
    return stmt.get(username) as AdminEntity | undefined;
  }

  findAdminById(id: number): AdminEntity | undefined {
    const stmt = this.db.prepare(
      'SELECT id, username, name, role, refreshToken, createdAt FROM admins WHERE id = ?',
    );
    return stmt.get(id) as AdminEntity | undefined;
  }

  updateAdminRefreshToken(
    id: number,
    hashedRefreshToken: string | null,
  ): void {
    const stmt = this.db.prepare(
      'UPDATE admins SET refreshToken = ? WHERE id = ?',
    );
    stmt.run(hashedRefreshToken, id);
  }
}
