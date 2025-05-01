// Sample External Services data for development
// In a production environment, this would fetch real status from RSS feeds

export async function getExternalServicesData() {
  // This function would typically fetch and parse real RSS feeds for services
  
  try {
    // Simulated data for development
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
  } catch (error) {
    console.error("Error fetching External Services data:", error);
    throw error;
  }
}
