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

export const predictionHistory = pgTable("prediction_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  i0: real("i0").notNull(),
  pa500: real("pa500").notNull(),
  hfs: real("hfs").notNull(),
  da: real("da").notNull(),
  area: real("area").notNull(),
  aDa: real("a_da").notNull(),
  maxIp: real("max_ip").notNull(),
  dr: real("dr").notNull(),
  p: real("p").notNull(),
  predictedClass: text("predicted_class").notNull(),
  confidence: real("confidence").notNull(),
  isMalignant: integer("is_malignant").notNull(),
  nearestClasses: text("nearest_classes").notNull(),
});

export const insertPredictionSchema = createInsertSchema(predictionHistory).omit({ id: true, createdAt: true });
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictionHistory.$inferSelect;

export const diagnosisInputSchema = z.object({
  i0: z.number().min(0, "Must be positive"),
  pa500: z.number(),
  hfs: z.number(),
  da: z.number().min(0, "Must be positive"),
  area: z.number().min(0, "Must be positive"),
  aDa: z.number().min(0, "Must be positive"),
  maxIp: z.number().min(0, "Must be positive"),
  dr: z.number(),
  p: z.number().min(0, "Must be positive"),
});

export type DiagnosisInput = z.infer<typeof diagnosisInputSchema>;

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
