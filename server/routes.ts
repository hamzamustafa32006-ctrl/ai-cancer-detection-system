import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  return httpServer;
}
