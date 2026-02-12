import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const impedanceSamples = pgTable("impedance_samples", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tissueClass: text("tissue_class").notNull(),
  i0: real("i0").notNull(),
  pa500: real("pa500").notNull(),
  hfs: real("hfs").notNull(),
  da: real("da").notNull(),
  area: real("area").notNull(),
  aDa: real("a_da").notNull(),
  maxIp: real("max_ip").notNull(),
  dr: real("dr").notNull(),
  p: real("p").notNull(),
});

export const insertImpedanceSampleSchema = createInsertSchema(impedanceSamples).omit({ id: true });
export type InsertImpedanceSample = z.infer<typeof insertImpedanceSampleSchema>;
export type ImpedanceSample = typeof impedanceSamples.$inferSelect;

export const tissueClassLabels: Record<string, string> = {
  car: "Carcinoma",
  fad: "Fibroadenoma",
  mas: "Mastopathy",
  gla: "Glandular",
  con: "Connective",
  adi: "Adipose",
};

export const tissueClassColors: Record<string, string> = {
  car: "hsl(0, 70%, 50%)",
  fad: "hsl(45, 80%, 50%)",
  mas: "hsl(200, 75%, 55%)",
  gla: "hsl(150, 65%, 45%)",
  con: "hsl(260, 60%, 60%)",
  adi: "hsl(30, 70%, 55%)",
};
