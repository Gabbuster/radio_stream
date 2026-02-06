import { db } from "./db";
import { stations, type Station, type InsertStation } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getStations(): Promise<Station[]>;
  getStation(id: number): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
}

export class DatabaseStorage implements IStorage {
  async getStations(): Promise<Station[]> {
    return await db.select().from(stations);
  }

  async getStation(id: number): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    const [station] = await db.insert(stations).values(insertStation).returning();
    return station;
  }
}

export const storage = new DatabaseStorage();
