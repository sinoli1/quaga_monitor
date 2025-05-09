import axios from 'axios';

const API_BASE_URL = 'http://10.200.0.212:5000';

// Service functions
const getArubaData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/aruba`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Aruba data:", error);
    throw error;
  }
};

const getAteraData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/atera`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Atera data:", error);
    throw error;
  }
};

const getExternalServicesData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rss`);
    return response.data;
  } catch (error) {
    console.error("Error fetching External Services data:", error);
    throw error;
  }
};

const getGmailBackupAlerts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gmail`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Gmail Backup Alerts data:", error);
    throw error;
  }
};

const getUptimeRobotData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/uptime`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Uptime Robot data:", error);
    throw error;
  }
};

// Controller functions
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
