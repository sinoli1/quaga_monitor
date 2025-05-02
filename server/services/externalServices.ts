import axios from 'axios';

export async function getExternalServicesData() {
  try {
    // Fetch from local API endpoint
    const response = await axios.get('http://127.0.0.1:5000/rss');
    return response.data;
  } catch (error) {
    console.error("Error fetching External Services data:", error);
    // If the API fails, return sample data as fallback
    return {
      services: {
        "No-IP": "Up",
        "AnyDesk": "Up",
        "Freshdesk": "Up",
        "UptimeRobot": "Down", // One service down for demo
        "Slack": "Up",
        "Google Workspace": "Up",
        "NextDNS": "Up",
        "Google Cloud": "Up"
      },
      timestamp: new Date().toISOString()
    };
  }
}
