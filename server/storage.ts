import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  impedanceSamples,
  type User,
  type InsertUser,
  type ImpedanceSample,
  type InsertImpedanceSample,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllImpedanceSamples(): Promise<ImpedanceSample[]>;
  getImpedanceSamplesByClass(tissueClass: string): Promise<ImpedanceSample[]>;
  insertImpedanceSample(sample: InsertImpedanceSample): Promise<ImpedanceSample>;
  insertManyImpedanceSamples(samples: InsertImpedanceSample[]): Promise<void>;
  getImpedanceSampleCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllImpedanceSamples(): Promise<ImpedanceSample[]> {
    return db.select().from(impedanceSamples);
  }

  async getImpedanceSamplesByClass(tissueClass: string): Promise<ImpedanceSample[]> {
    return db.select().from(impedanceSamples).where(eq(impedanceSamples.tissueClass, tissueClass));
  }

  async insertImpedanceSample(sample: InsertImpedanceSample): Promise<ImpedanceSample> {
    const [result] = await db.insert(impedanceSamples).values(sample).returning();
    return result;
  }

  async insertManyImpedanceSamples(samples: InsertImpedanceSample[]): Promise<void> {
    if (samples.length === 0) return;
    await db.insert(impedanceSamples).values(samples);
  }

  async getImpedanceSampleCount(): Promise<number> {
    const result = await db.select().from(impedanceSamples);
    return result.length;
  }
}

export const storage = new DatabaseStorage();
