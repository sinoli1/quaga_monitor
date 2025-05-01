import type { Express } from "express";
import { createServer, type Server } from "http";
import { getUptimeRobotData } from "./services/uptimeRobot";
import { getAteraData } from "./services/atera";
import { getArubaData } from "./services/aruba";
import { getExternalServicesData } from "./services/externalServices";
import { getGmailBackupAlerts } from "./services/gmail";

export async function registerRoutes(app: Express): Promise<Server> {
  // Uptime Robot data endpoint
  app.get("/uptime", async (_req, res) => {
    try {
      const data = await getUptimeRobotData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Uptime Robot data:", error);
      res.status(500).json({ error: "Failed to fetch Uptime Robot data" });
    }
  });

  // Atera data endpoint
  app.get("/atera", async (_req, res) => {
    try {
      const data = await getAteraData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Atera data:", error);
      res.status(500).json({ error: "Failed to fetch Atera data" });
    }
  });

  // Aruba data endpoint
  app.get("/aruba", async (_req, res) => {
    try {
      const data = await getArubaData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Aruba data:", error);
      res.status(500).json({ error: "Failed to fetch Aruba data" });
    }
  });

  // External Services (RSS) data endpoint
  app.get("/rss", async (_req, res) => {
    try {
      const data = await getExternalServicesData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching External Services data:", error);
      res.status(500).json({ error: "Failed to fetch External Services data" });
    }
  });

  // Gmail Backup Alerts data endpoint
  app.get("/gmail", async (_req, res) => {
    try {
      const data = await getGmailBackupAlerts();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Gmail Backup Alerts data:", error);
      res.status(500).json({ error: "Failed to fetch Gmail Backup Alerts data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
