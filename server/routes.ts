import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { diagnosisInputSchema } from "@shared/schema";
import { predict } from "./classifier";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/impedance-samples", async (_req, res) => {
    try {
      const samples = await storage.getAllImpedanceSamples();
      res.json(samples);
    } catch (error) {
      console.error("Error fetching impedance samples:", error);
      res.status(500).json({ message: "Failed to fetch impedance samples" });
    }
  });

  app.get("/api/impedance-samples/:tissueClass", async (req, res) => {
    try {
      const samples = await storage.getImpedanceSamplesByClass(req.params.tissueClass);
      res.json(samples);
    } catch (error) {
      console.error("Error fetching impedance samples by class:", error);
      res.status(500).json({ message: "Failed to fetch impedance samples" });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const samples = await storage.getAllImpedanceSamples();
      const classCounts: Record<string, number> = {};
      samples.forEach((s) => {
        classCounts[s.tissueClass] = (classCounts[s.tissueClass] || 0) + 1;
      });
      res.json({
        totalSamples: samples.length,
        totalClasses: Object.keys(classCounts).length,
        classCounts,
        features: 9,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/diagnosis", async (req, res) => {
    try {
      const parsed = diagnosisInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input data",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const input = parsed.data;
      const trainingData = await storage.getAllImpedanceSamples();

      if (trainingData.length === 0) {
        return res.status(500).json({ message: "No training data available" });
      }

      const result = predict(input, trainingData);

      const prediction = await storage.insertPrediction({
        ...input,
        predictedClass: result.predictedClass,
        confidence: result.confidence,
        isMalignant: result.isMalignant ? 1 : 0,
        nearestClasses: result.nearestClasses.join(","),
      });

      res.json({
        prediction,
        result,
      });
    } catch (error) {
      console.error("Error running diagnosis:", error);
      res.status(500).json({ message: "Failed to run diagnosis" });
    }
  });

  app.post("/api/diagnosis-batch", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvText = req.file.buffer.toString("utf-8");
      const lines = csvText.trim().split(/\r?\n/);

      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV file must have a header row and at least one data row" });
      }

      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const columnMap: Record<string, string> = {
        i0: "i0",
        io: "i0",
        pa500: "pa500",
        hfs: "hfs",
        da: "da",
        area: "area",
        "a/da": "aDa",
        a_da: "aDa",
        ada: "aDa",
        maxip: "maxIp",
        max_ip: "maxIp",
        "max ip": "maxIp",
        dr: "dr",
        p: "p",
      };

      const featureKeys = ["i0", "pa500", "hfs", "da", "area", "aDa", "maxIp", "dr", "p"];
      const colIndices: Record<string, number> = {};

      for (let i = 0; i < header.length; i++) {
        const mapped = columnMap[header[i]];
        if (mapped) colIndices[mapped] = i;
      }

      const missingCols = featureKeys.filter((k) => !(k in colIndices));
      if (missingCols.length > 0) {
        return res.status(400).json({
          message: `Missing required columns: ${missingCols.join(", ")}. Expected: I0, PA500, HFS, DA, Area, A/DA, MaxIP, DR, P`,
        });
      }

      const trainingData = await storage.getAllImpedanceSamples();
      if (trainingData.length === 0) {
        return res.status(500).json({ message: "No training data available" });
      }

      const results: any[] = [];
      const errors: { row: number; message: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const cols = lines[i].split(",").map((c) => c.trim());
        const rowData: Record<string, number> = {};

        let hasError = false;
        for (const key of featureKeys) {
          const val = parseFloat(cols[colIndices[key]]);
          if (isNaN(val)) {
            errors.push({ row: i + 1, message: `Invalid value for ${key}` });
            hasError = true;
            break;
          }
          rowData[key] = val;
        }
        if (hasError) continue;

        const parsed = diagnosisInputSchema.safeParse(rowData);
        if (!parsed.success) {
          errors.push({ row: i + 1, message: "Validation failed" });
          continue;
        }

        const result = predict(parsed.data, trainingData);

        const prediction = await storage.insertPrediction({
          ...parsed.data,
          predictedClass: result.predictedClass,
          confidence: result.confidence,
          isMalignant: result.isMalignant ? 1 : 0,
          nearestClasses: result.nearestClasses.join(","),
        });

        results.push({
          row: i + 1,
          prediction,
          result,
        });
      }

      res.json({
        total: results.length + errors.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      });
    } catch (error) {
      console.error("Error running batch diagnosis:", error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  app.get("/api/diagnosis-history", async (_req, res) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 20;
      const predictions = await storage.getRecentPredictions(Math.min(limit, 100));
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching diagnosis history:", error);
      res.status(500).json({ message: "Failed to fetch diagnosis history" });
    }
  });

  return httpServer;
}
