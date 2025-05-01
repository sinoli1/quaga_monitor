// Sample Uptime Robot data for development
// In a production environment, this would connect to the Uptime Robot API

export async function getUptimeRobotData() {
  // This function would typically call the Uptime Robot API with API key
  // const apiKey = process.env.UPTIME_ROBOT_API_KEY;
  
  try {
    // Simulated data for development
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
  } catch (error) {
    console.error("Error fetching Uptime Robot data:", error);
    throw error;
  }
}
