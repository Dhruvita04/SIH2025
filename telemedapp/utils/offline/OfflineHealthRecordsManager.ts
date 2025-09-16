interface HealthRecord {
  id: string;
  type: 'vital' | 'medication' | 'allergy' | 'condition' | 'vaccination' | 'lab_result' | 'prescription';
  title: string;
  value?: string;
  date: string;
  doctor?: string;
  notes?: string;
  isOfflineData?: boolean;
  pendingSync?: boolean;
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  lastUpdated: string;
}

export class OfflineHealthRecordsManager {
  private static instance: OfflineHealthRecordsManager;
  private readonly HEALTH_RECORDS_KEY = 'healthRecords';
  private readonly VITAL_SIGNS_KEY = 'vitalSigns';
  private readonly PENDING_SYNC_KEY = 'pendingHealthRecords';
  private readonly LAST_SYNC_KEY = 'lastSyncTime';

  static getInstance(): OfflineHealthRecordsManager {
    if (!OfflineHealthRecordsManager.instance) {
      OfflineHealthRecordsManager.instance = new OfflineHealthRecordsManager();
    }
    return OfflineHealthRecordsManager.instance;
  }

  // Save health records to localStorage
  saveHealthRecords(records: HealthRecord[]): boolean {
    try {
      localStorage.setItem(this.HEALTH_RECORDS_KEY, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error('Error saving health records:', error);
      return false;
    }
  }

  // Load health records from localStorage
  loadHealthRecords(): HealthRecord[] {
    try {
      const saved = localStorage.getItem(this.HEALTH_RECORDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading health records:', error);
      return [];
    }
  }

  // Save vital signs to localStorage
  saveVitalSigns(vitals: VitalSigns): boolean {
    try {
      localStorage.setItem(this.VITAL_SIGNS_KEY, JSON.stringify(vitals));
      return true;
    } catch (error) {
      console.error('Error saving vital signs:', error);
      return false;
    }
  }

  // Load vital signs from localStorage
  loadVitalSigns(): VitalSigns | null {
    try {
      const saved = localStorage.getItem(this.VITAL_SIGNS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading vital signs:', error);
      return null;
    }
  }

  // Add a record to pending sync queue (for when offline)
  addToPendingSync(record: HealthRecord): boolean {
    try {
      const pending = this.getPendingSync();
      const updatedPending = [...pending, { ...record, pendingSync: true }];
      localStorage.setItem(this.PENDING_SYNC_KEY, JSON.stringify(updatedPending));
      return true;
    } catch (error) {
      console.error('Error adding to pending sync:', error);
      return false;
    }
  }

  // Get pending sync records
  getPendingSync(): HealthRecord[] {
    try {
      const saved = localStorage.getItem(this.PENDING_SYNC_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting pending sync records:', error);
      return [];
    }
  }

  // Clear pending sync records after successful sync
  clearPendingSync(): boolean {
    try {
      localStorage.removeItem(this.PENDING_SYNC_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing pending sync:', error);
      return false;
    }
  }

  // Update last sync time
  updateLastSyncTime(): void {
    try {
      const now = new Date().toISOString();
      localStorage.setItem(this.LAST_SYNC_KEY, now);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  // Get last sync time
  getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(this.LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Check if device is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Sync data with server when online
  async syncWithServer(): Promise<boolean> {
    if (!this.isOnline()) {
      console.log('Cannot sync - device is offline');
      return false;
    }

    try {
      const pendingRecords = this.getPendingSync();
      
      if (pendingRecords.length === 0) {
        console.log('No pending records to sync');
        return true;
      }

      // In a real implementation, this would make API calls to sync with the backend
      // For demonstration, we'll simulate a sync operation
      console.log(`Syncing ${pendingRecords.length} pending records...`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as synced
      const allRecords = this.loadHealthRecords();
      const syncedRecords = allRecords.map(record => ({
        ...record,
        isOfflineData: false,
        pendingSync: false
      }));
      
      this.saveHealthRecords(syncedRecords);
      this.clearPendingSync();
      this.updateLastSyncTime();
      
      console.log('Sync completed successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  // Get storage usage information
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          console.log('Storage quota:', estimate.quota);
          console.log('Storage usage:', estimate.usage);
        });
      }
      
      // Fallback calculation using localStorage size
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      // Approximate available storage (5MB typical for localStorage)
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Export health records as JSON
  exportHealthRecords(): string {
    const records = this.loadHealthRecords();
    const vitals = this.loadVitalSigns();
    const lastSync = this.getLastSyncTime();
    
    const exportData = {
      healthRecords: records,
      vitalSigns: vitals,
      lastSync: lastSync,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import health records from JSON
  importHealthRecords(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.healthRecords && Array.isArray(data.healthRecords)) {
        this.saveHealthRecords(data.healthRecords);
      }
      
      if (data.vitalSigns) {
        this.saveVitalSigns(data.vitalSigns);
      }
      
      console.log('Health records imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing health records:', error);
      return false;
    }
  }

  // Clear all offline data
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.HEALTH_RECORDS_KEY);
      localStorage.removeItem(this.VITAL_SIGNS_KEY);
      localStorage.removeItem(this.PENDING_SYNC_KEY);
      localStorage.removeItem(this.LAST_SYNC_KEY);
      console.log('All offline health data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

export default OfflineHealthRecordsManager;