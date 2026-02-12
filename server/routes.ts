import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { diagnosisInputSchema } from "@shared/schema";
import { predict } from "./classifier";
import { parseRamanCSV, analyzeRamanSpectrum } from "./raman-analyzer";

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

  app.post(
    "/api/diagnosis",
    upload.fields([
      { name: "impedanceFile", maxCount: 1 },
      { name: "ramanFile", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files?.impedanceFile?.[0]) {
          return res.status(400).json({ message: "Impedance data file is required" });
        }
        if (!files?.ramanFile?.[0]) {
          return res.status(400).json({ message: "Raman spectroscopy file is required" });
        }

        const impedanceCsv = files.impedanceFile[0].buffer.toString("utf-8");
        const ramanCsv = files.ramanFile[0].buffer.toString("utf-8");

        const impedanceLines = impedanceCsv.trim().split(/\r?\n/);
        if (impedanceLines.length < 2) {
          return res.status(400).json({ message: "Impedance CSV must have a header row and at least one data row" });
        }

        const header = impedanceLines[0].split(",").map((h) => h.trim().toLowerCase());
        const columnMap: Record<string, string> = {
          i0: "i0", io: "i0", pa500: "pa500", hfs: "hfs", da: "da",
          area: "area", "a/da": "aDa", a_da: "aDa", ada: "aDa",
          maxip: "maxIp", max_ip: "maxIp", "max ip": "maxIp", dr: "dr", p: "p",
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
            message: `Missing impedance columns: ${missingCols.join(", ")}. Expected: I0, PA500, HFS, DA, Area, A/DA, MaxIP, DR, P`,
          });
        }

        const dataRows = impedanceLines.slice(1).filter((l) => l.trim());
        if (dataRows.length === 0) {
          return res.status(400).json({ message: "No data row found in impedance file" });
        }
        if (dataRows.length > 1) {
          return res.status(400).json({ message: "Impedance file should contain exactly one sample (one data row). Upload one sample per diagnosis." });
        }

        let ramanData;
        let ramanAnalysis;
        try {
          ramanData = parseRamanCSV(ramanCsv);
          if (ramanData.length < 10) {
            return res.status(400).json({ message: "Raman file must contain at least 10 data points" });
          }
          ramanAnalysis = analyzeRamanSpectrum(ramanData);
        } catch (err: any) {
          return res.status(400).json({ message: `Raman file error: ${err.message}` });
        }

        const trainingData = await storage.getAllImpedanceSamples();
        if (trainingData.length === 0) {
          return res.status(500).json({ message: "No training data available" });
        }

        const dataLine = dataRows[0];
        if (!dataLine?.trim()) {
          return res.status(400).json({ message: "No data row found in impedance file" });
        }

        const cols = dataLine.split(",").map((c) => c.trim());
        const rowData: Record<string, number> = {};
        for (const key of featureKeys) {
          const val = parseFloat(cols[colIndices[key]]);
          if (isNaN(val)) {
            return res.status(400).json({ message: `Invalid value for ${key} in impedance file` });
          }
          rowData[key] = val;
        }

        const parsed = diagnosisInputSchema.safeParse(rowData);
        if (!parsed.success) {
          return res.status(400).json({ message: "Impedance data validation failed", errors: parsed.error.flatten().fieldErrors });
        }

        const impedanceResult = predict(parsed.data, trainingData);

        const prediction = await storage.insertPrediction({
          ...parsed.data,
          predictedClass: impedanceResult.predictedClass,
          confidence: impedanceResult.confidence,
          isMalignant: impedanceResult.isMalignant ? 1 : 0,
          nearestClasses: impedanceResult.nearestClasses.join(","),
        });

        res.json({
          prediction,
          impedanceResult,
          ramanAnalysis,
        });
      } catch (error) {
        console.error("Error running diagnosis:", error);
        res.status(500).json({ message: "Failed to run diagnosis" });
      }
    }
  );

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
