// Sample Atera data for development
// In a production environment, this would connect to the Atera API

export async function getAteraData() {
  // This function would typically call the Atera API with API key
  // const apiKey = process.env.ATERA_API_KEY;
  
  try {
    // Simulated data for development
    return [
      {
        alert_id: "a1",
        DeviceName: "Server01",
        CustomerName: "Client DEF",
        AlertMessage: "Machine status unknown",
        incidents: [
          {
            created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          }
        ],
        resolved: null
      },
      {
        alert_id: "a2",
        DeviceName: "Firewall",
        CustomerName: "Client GHI",
        AlertMessage: "High CPU usage detected (95% for 15 min)",
        incidents: [
          {
            created: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
          }
        ],
        resolved: null
      }
    ];
  } catch (error) {
    console.error("Error fetching Atera data:", error);
    throw error;
  }
}
