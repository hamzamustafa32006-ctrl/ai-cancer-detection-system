import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { diagnosisInputSchema } from "@shared/schema";
import { predict } from "./classifier";

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
