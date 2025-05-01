// Sample Gmail Backup Alerts data for development
// In a production environment, this would connect to Gmail API

export async function getGmailBackupAlerts() {
  // This function would typically connect to Gmail API with OAuth
  // const gmailApiKey = process.env.GMAIL_API_KEY;
  
  try {
    // Simulated data for development
    return {
      "Client JKL": {
        "Estado": "Backup Failed",
        "FechaEnvio": new Date(new Date().setHours(3, 45, 0, 0)).toISOString(), // Today at 3:45 AM
        "Cuerpo": "Error accessing backup destination. Connection refused. Full error message: Connection to backup server 192.168.10.15 failed after 3 retries. Error code: ERR_CONNECTION_REFUSED. Backup job ID: BKP-2023-0615-01. Last successful backup: June 14, 2023"
      },
      "Client MNO": {
        "Estado": "Backup Warning",
        "FechaEnvio": new Date(Date.now() - 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 32 * 60 * 1000).toISOString(), // Yesterday, 11:32 PM
        "Cuerpo": "Backup completed with warnings. 2 files could not be accessed. Warning details: Unable to backup 2 locked files in D:\\Databases\\. Files are in use by SQL Server process. All other files were successfully backed up. Backup size: 128.5 GB (95% of expected size)"
      },
      "Client PQR": {
        "Estado": "Backup Failed",
        "FechaEnvio": new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), // Yesterday, 4:15 AM
        "Cuerpo": "Backup task aborted. Insufficient disk space on destination. Error details: Backup operation started but aborted after 45 minutes. The destination drive E: has only 25.8 GB free space, but requires at least 150 GB for this backup job. Recommendation: Clean up backup destination or allocate additional storage."
      }
    };
  } catch (error) {
    console.error("Error fetching Gmail Backup Alerts data:", error);
    throw error;
  }
}
