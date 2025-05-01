import { getUptimeRobotData } from "../services/uptimeRobot";
import { getAteraData } from "../services/atera";
import { getArubaData } from "../services/aruba";
import { getExternalServicesData } from "../services/externalServices";
import { getGmailBackupAlerts } from "../services/gmail";

// Controller functions for monitoring data
export const getUptimeRobotController = async () => {
  try {
    return await getUptimeRobotData();
  } catch (error) {
    console.error("Error in Uptime Robot controller:", error);
    throw error;
  }
};

export const getAteraController = async () => {
  try {
    return await getAteraData();
  } catch (error) {
    console.error("Error in Atera controller:", error);
    throw error;
  }
};

export const getArubaController = async () => {
  try {
    return await getArubaData();
  } catch (error) {
    console.error("Error in Aruba controller:", error);
    throw error;
  }
};

export const getExternalServicesController = async () => {
  try {
    return await getExternalServicesData();
  } catch (error) {
    console.error("Error in External Services controller:", error);
    throw error;
  }
};

export const getGmailBackupAlertsController = async () => {
  try {
    return await getGmailBackupAlerts();
  } catch (error) {
    console.error("Error in Gmail Backup Alerts controller:", error);
    throw error;
  }
};
