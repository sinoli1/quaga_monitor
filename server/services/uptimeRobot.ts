import axios from 'axios';

export async function getUptimeRobotData() {
  try {
    // Fetch from local API endpoint
    const response = await axios.get('http://127.0.0.1:5000/uptime');
    return response.data;
  } catch (error) {
    console.error("Error fetching Uptime Robot data:", error);
    // If the API fails, return sample data as fallback
    return [
      {
        friendly_name: "Client ABC",
        monitors_id: {
          "12345": {
            friendly_name: "Main Website",
            status: "Down",
            url: "https://clientabc.com/main",
            incidents: [
              {
                last_down: new Date(Date.now() - 35 * 60 * 1000).toISOString() // 35 minutes ago
              }
            ]
          }
        },
        custom_url: "https://stats.uptimerobot.com/abc123"
      },
      {
        friendly_name: "Client XYZ",
        monitors_id: {
          "67890": {
            friendly_name: "API Endpoint",
            status: "Unknown",
            url: "https://api.clientxyz.com/v2",
            incidents: [
              {
                last_down: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
              }
            ]
          }
        },
        custom_url: "https://stats.uptimerobot.com/xyz456"
      }
    ];
  }
}
