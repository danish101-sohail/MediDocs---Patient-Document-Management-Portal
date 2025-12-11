import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config();

/**
 * TODO: For production, switch to PostgreSQL + an ORM like Prisma
 * SQLite is fine for now but won't handle concurrent users well
 */
class DocumentModel {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  initDatabase() {
    this.db = new sqlite3.Database(process.env.DB_PATH , (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('Connected to SQLite database');
      this.createTable();
    });
  }

  createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_filename TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        filesize INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) console.error('Error creating table:', err);
    });
  }

  // Helper method to get all document fields with IST timezone
  getDocumentFields() {
    return `
      id,
      original_filename,
      filename,
      filepath,
      filesize,
      datetime(created_at, '+5 hours', '+30 minutes') as created_at
    `;
  }

  create(documentData) {
    return new Promise((resolve, reject) => {
      const { original_filename, filename, filepath, filesize } = documentData;
      const self = this;

      this.db.run(
        'INSERT INTO documents (original_filename, filename, filepath, filesize) VALUES (?, ?, ?, ?)',
        [original_filename, filename, filepath, filesize],
        function (err) {
          if (err) return reject(err);

          self.db.get(
            `SELECT ${self.getDocumentFields()} FROM documents WHERE id = ?`,
            [this.lastID],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        }
      );
    });
  }

  // TODO: Add pagination - loading 10k documents at once will kill performance
  findAll() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ${this.getDocumentFields()} FROM documents ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT ${this.getDocumentFields()} FROM documents WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  }

  // TODO: Consider soft deletes (add deleted_at column) for data recovery
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM documents WHERE id = ?',
        [id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) return reject(err);
        console.log('Database connection closed');
        resolve();
      });
    });
  }
}

export default new DocumentModel();