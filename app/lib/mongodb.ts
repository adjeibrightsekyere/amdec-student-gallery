import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI environment variable is not set");
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  return client.db("student-gallery");
}