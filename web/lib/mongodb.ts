import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'besu';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
