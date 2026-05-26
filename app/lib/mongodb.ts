import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri);

const clientPromise = client.connect();

export async function getDb() {
  const connectedClient = await clientPromise;

  return connectedClient.db("student-gallery");
}