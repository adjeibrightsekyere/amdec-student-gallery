import { getDb } from "./mongodb";
import type { UpdateFilter } from "mongodb";

export async function getActivities() {
  const db = await getDb();
  return db.collection("activities").find({}).toArray();
}

export async function addActivity(activity: any) {
  const db = await getDb();
  return db.collection("activities").insertOne(activity);
}

export async function updateActivity(id: number, data: any) {
  const db = await getDb();
  return db.collection("activities").updateOne({ id }, { $set: data });
}

export async function pushImagesToActivity(id: number, images: string[]) {
  const db = await getDb();
  const update = { $push: { images: { $each: images } } } as unknown as UpdateFilter<any>;
  return db.collection("activities").updateOne({ id }, update);
}

export async function removeImageFromActivity(id: number, imageUrl: string) {
  const db = await getDb();
  // cast via unknown to satisfy mongodb's UpdateFilter typing for $pull
  const update = { $pull: { images: imageUrl } } as unknown as UpdateFilter<any>;
  return db.collection("activities").updateOne({ id }, update);
}
