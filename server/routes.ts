import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { getUptimeRobotData } from "./services/uptimeRobot";
import { getAteraData } from "./services/atera";
import { getArubaData } from "./services/aruba";
import { getExternalServicesData } from "./services/externalServices";
import { getGmailBackupAlerts } from "./services/gmail";

// Monitor data cache
let monitoringCache = {
  uptime: null,
  atera: null,
  aruba: null,
  rss: null,
  gmail: null,
  timestamp: new Date().toISOString()
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Uptime Robot data endpoint
  app.get("/uptime", async (_req, res) => {
    try {
      const data = await getUptimeRobotData();
      monitoringCache.uptime = data;
      monitoringCache.timestamp = new Date().toISOString();
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
      monitoringCache.atera = data;
      monitoringCache.timestamp = new Date().toISOString();
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
      monitoringCache.aruba = data;
      monitoringCache.timestamp = new Date().toISOString();
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
      monitoringCache.rss = data;
      monitoringCache.timestamp = new Date().toISOString();
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
      monitoringCache.gmail = data;
      monitoringCache.timestamp = new Date().toISOString();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Gmail Backup Alerts data:", error);
      res.status(500).json({ error: "Failed to fetch Gmail Backup Alerts data" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server on distinct path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'init', 
        data: monitoringCache
      }));
    }
    
    // Set up a 5-second interval to push updates to client
    const intervalId = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          type: 'update', 
          data: monitoringCache,
          timestamp: new Date().toISOString()
        }));
      }
    }, 5000);
    
    // Clean up interval on client disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(intervalId);
    });
  });
  
  return httpServer;
}
