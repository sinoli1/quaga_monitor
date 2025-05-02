import axios from 'axios';

export async function getArubaData() {
  try {
    // Fetch from local API endpoint
    const response = await axios.get('http://127.0.0.1:5000/aruba');
    return response.data;
  } catch (error) {
    console.error("Error fetching Aruba data:", error);
    // If the API fails, return sample data as fallback
    return [
      {
        site_name: "Office Location",
        total_devices: 5,
        total_devices_problem: 2,
        devices: [
          {
            device_name: "AP-Office-01",
            model: "AP-505",
            ip: "192.168.1.10",
            mac: "AA:BB:CC:DD:EE:FF",
            status: "offline",
            last_seen: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
            seconds_offline: 35 * 60, // 35 minutes in seconds
          },
          {
            device_name: "AP-Office-02",
            model: "AP-505",
            ip: "192.168.1.11",
            mac: "AA:BB:CC:DD:EE:00",
            status: "offline",
            last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            seconds_offline: 2 * 60 * 60, // 2 hours in seconds
          },
          {
            device_name: "AP-Office-03",
            model: "AP-515",
            ip: "192.168.1.12",
            mac: "AA:BB:CC:DD:EE:01",
            status: "connected",
            last_seen: new Date().toISOString(), // Now
            seconds_offline: 0,
          },
          {
            device_name: "AP-Office-04",
            model: "AP-515",
            ip: "192.168.1.13",
            mac: "AA:BB:CC:DD:EE:02",
            status: "connected",
            last_seen: new Date().toISOString(), // Now
            seconds_offline: 0,
          },
          {
            device_name: "AP-Office-05",
            model: "AP-515",
            ip: "192.168.1.14",
            mac: "AA:BB:CC:DD:EE:03",
            status: "connected",
            last_seen: new Date().toISOString(), // Now
            seconds_offline: 0,
          },
        ],
      },
    ];
  }
}
