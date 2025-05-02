import axios from 'axios';

export async function getAteraData() {
  try {
    // Fetch from local API endpoint
    const response = await axios.get('http://127.0.0.1:5000/atera');
    return response.data;
  } catch (error) {
    console.error("Error fetching Atera data:", error);
    // If the API fails, return sample data as fallback
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
  }
}
