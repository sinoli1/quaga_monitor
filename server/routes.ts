import type { Express } from "express";
import { createServer, type Server } from "http";
import {
  getUptimeRobotController,
  getAteraController,
  getArubaController,
  getExternalServicesController,
  getGmailBackupAlertsController
} from "./controllers/monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/uptime", async (_req, res) => {
    try {
      const data = await getUptimeRobotController();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Uptime Robot data:", error);
      res.status(500).json({ error: "Failed to fetch Uptime Robot data" });
    }
  });

  app.get("/atera", async (_req, res) => {
    try {
      const data = await getAteraController();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Atera data:", error);
      res.status(500).json({ error: "Failed to fetch Atera data" });
    }
  });

  app.get("/aruba", async (_req, res) => {
    try {
      const data = await getArubaController();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Aruba data:", error);
      res.status(500).json({ error: "Failed to fetch Aruba data" });
    }
  });

  app.get("/rss", async (_req, res) => {
    try {
      const data = await getExternalServicesController();
      res.json(data);
    } catch (error) {
      console.error("Error fetching External Services data:", error);
      res.status(500).json({ error: "Failed to fetch External Services data" });
    }
  });

  app.get("/gmail", async (_req, res) => {
    try {
      const data = await getGmailBackupAlertsController();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Gmail Backup Alerts data:", error);
      res.status(500).json({ error: "Failed to fetch Gmail Backup Alerts data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
