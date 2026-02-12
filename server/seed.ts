import { storage } from "./storage";
import { type InsertImpedanceSample } from "@shared/schema";
import { log } from "./index";
import * as fs from "fs";
import * as path from "path";

export async function seedDatabase() {
  try {
    const count = await storage.getImpedanceSampleCount();
    if (count > 0) {
      log(`Database already seeded with ${count} impedance samples`, "seed");
      return;
    }

    log("Seeding database with impedance data...", "seed");

    const csvPath = path.resolve(process.cwd(), "attached_assets/data_1770930662161.csv");
    if (!fs.existsSync(csvPath)) {
      log("CSV file not found, skipping seed", "seed");
      return;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");
    const header = lines[0].replace(/"/g, "").split(",");

    const samples: InsertImpedanceSample[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length < 10) continue;

      const tissueClass = values[0].replace(/"/g, "").trim();
      samples.push({
        tissueClass,
        i0: parseFloat(values[1]),
        pa500: parseFloat(values[2]),
        hfs: parseFloat(values[3]),
        da: parseFloat(values[4]),
        area: parseFloat(values[5]),
        aDa: parseFloat(values[6]),
        maxIp: parseFloat(values[7]),
        dr: parseFloat(values[8]),
        p: parseFloat(values[9]),
      });
    }

    await storage.insertManyImpedanceSamples(samples);
    log(`Seeded ${samples.length} impedance samples`, "seed");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
