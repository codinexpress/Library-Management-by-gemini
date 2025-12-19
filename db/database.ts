
import { Book } from "../types";

declare var initSqlJs: any;

let db: any = null;
let fileHandle: FileSystemFileHandle | null = null;

export const initDatabase = async () => {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
  });

  // Start with a new DB or empty
  db = new SQL.Database();
  createTables();
  return db;
};

const createTables = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      category TEXT,
      status TEXT DEFAULT 'Available',
      borrower TEXT,
      description TEXT,
      added_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const connectToFile = async () => {
  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [{
        description: 'SQLite Database',
        accept: { 'application/x-sqlite3': ['.db', '.sqlite'] },
      }],
      multiple: false
    });
    fileHandle = handle;
    const file = await fileHandle!.getFile();
    const arrayBuffer = await file.arrayBuffer();
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    db = new SQL.Database(new Uint8Array(arrayBuffer));
    return true;
  } catch (e) {
    console.error("Failed to connect to file:", e);
    return false;
  }
};

export const createNewFile = async () => {
  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: 'library.db',
      types: [{
        description: 'SQLite Database',
        accept: { 'application/x-sqlite3': ['.db'] },
      }],
    });
    fileHandle = handle;
    await saveDatabase();
    return true;
  } catch (e) {
    console.error("Failed to create new file:", e);
    return false;
  }
};

export const saveDatabase = async () => {
  if (!db || !fileHandle) return;
  const data = db.export();
  const writable = await (fileHandle as any).createWritable();
  await writable.write(data);
  await writable.close();
};

export const getBooks = (): Book[] => {
  if (!db) return [];
  const res = db.exec("SELECT * FROM books ORDER BY added_date DESC");
  if (res.length === 0) return [];
  
  const columns = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const book: any = {};
    columns.forEach((col: string, i: number) => {
      book[col] = row[i];
    });
    return book as Book;
  });
};

export const addBook = async (book: Partial<Book>) => {
  if (!db) return;
  const stmt = db.prepare(`
    INSERT INTO books (title, author, isbn, category, description, status)
    VALUES (?, ?, ?, ?, ?, 'Available')
  `);
  stmt.run([book.title, book.author, book.isbn, book.category, book.description]);
  stmt.free();
  await saveDatabase();
};

export const updateBookStatus = async (id: number, status: string, borrower: string | null) => {
  if (!db) return;
  db.run("UPDATE books SET status = ?, borrower = ? WHERE id = ?", [status, borrower, id]);
  await saveDatabase();
};

export const deleteBook = async (id: number) => {
  if (!db) return;
  db.run("DELETE FROM books WHERE id = ?", [id]);
  await saveDatabase();
};

export const isFileSystemSupported = () => 'showOpenFilePicker' in window;
