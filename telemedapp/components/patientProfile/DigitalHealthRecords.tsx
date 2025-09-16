"use client";

import React, { useState, useEffect } from "react";
import { FaHeartbeat, FaStethoscope, FaFileMedical, FaPrescriptionBottleAlt, FaWifi } from "react-icons/fa";
import { MdBloodtype, MdLocalHospital, MdVaccines, MdSignalWifiOff } from "react-icons/md";
import { BiHealth } from "react-icons/bi";
import useServiceWorker from "@/hooks/useServiceWorker";
import { OfflineHealthRecordsManager } from "@/utils/offline/OfflineHealthRecordsManager";

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

const DigitalHealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "70 kg",
    height: "170 cm",
    lastUpdated: new Date().toLocaleDateString()
  });
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: 'condition',
    title: '',
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Initialize service worker for offline functionality
  useServiceWorker();
  
  // Initialize offline manager
  const offlineManager = OfflineHealthRecordsManager.getInstance();

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Load data from localStorage on component mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage using offline manager
  const loadOfflineData = () => {
    try {
      const savedRecords = offlineManager.loadHealthRecords();
      const savedVitals = offlineManager.loadVitalSigns();
      const savedSyncTime = offlineManager.getLastSyncTime();

      if (savedRecords.length > 0) {
        setHealthRecords(savedRecords.map((record: HealthRecord) => ({ ...record, isOfflineData: !isOnline })));
      } else {
        loadSampleData();
      }

      if (savedVitals) {
        setVitalSigns(savedVitals);
      }

      if (savedSyncTime) {
        const syncDate = new Date(savedSyncTime);
        if (!isNaN(syncDate.getTime())) {
          setLastSyncTime(syncDate.toLocaleString());
        } else {
          setLastSyncTime("");
        }
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
      loadSampleData();
    }
  };

  // Save data using offline manager
  const saveToLocalStorage = (records: HealthRecord[], vitals: VitalSigns) => {
    try {
      offlineManager.saveHealthRecords(records);
      offlineManager.saveVitalSigns(vitals);
      offlineManager.updateLastSyncTime();
      const syncTime = offlineManager.getLastSyncTime();
      if (syncTime) {
        const syncDate = new Date(syncTime);
        if (!isNaN(syncDate.getTime())) {
          setLastSyncTime(syncDate.toLocaleString());
        } else {
          setLastSyncTime("");
        }
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Load sample data for demonstration
  const loadSampleData = () => {
    const sampleRecords: HealthRecord[] = [
      {
        id: '1',
        type: 'condition',
        title: 'Hypertension',
        value: 'Stage 1',
        date: '2024-01-15',
        doctor: 'Dr. Smith',
        notes: 'Regular monitoring required'
      },
      {
        id: '2',
        type: 'medication',
        title: 'Lisinopril',
        value: '10mg daily',
        date: '2024-01-15',
        doctor: 'Dr. Smith',
        notes: 'Take in the morning'
      },
      {
        id: '3',
        type: 'vaccination',
        title: 'COVID-19 Vaccine',
        value: 'Pfizer',
        date: '2024-02-10',
        doctor: 'Rural Health Clinic',
        notes: 'Booster dose'
      },
      {
        id: '4',
        type: 'allergy',
        title: 'Penicillin',
        value: 'Severe',
        date: '2023-12-01',
        notes: 'Causes rash and breathing difficulty'
      },
      {
        id: '5',
        type: 'lab_result',
        title: 'Blood Glucose',
        value: '95 mg/dL',
        date: '2024-02-20',
        doctor: 'Dr. Johnson',
        notes: 'Normal range'
      }
    ];

    setHealthRecords(sampleRecords);
    saveToLocalStorage(sampleRecords, vitalSigns);
  };

  // Sync offline data when coming back online
  const syncOfflineData = async () => {
    if (isOnline) {
      try {
        const success = await offlineManager.syncWithServer();
        if (success) {
          const syncTime = offlineManager.getLastSyncTime();
          if (syncTime) {
            const syncDate = new Date(syncTime);
            if (!isNaN(syncDate.getTime())) {
              setLastSyncTime(syncDate.toLocaleString());
            } else {
              setLastSyncTime("");
            }
          }
          
          // Reload records to update offline status
          const updatedRecords = offlineManager.loadHealthRecords();
          setHealthRecords(updatedRecords.map(record => ({ ...record, isOfflineData: false })));
        }
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    }
  };

  // Add new health record
  const addHealthRecord = () => {
    if (!newRecord.title) return;

    const record: HealthRecord = {
      id: Date.now().toString(),
      type: newRecord.type || 'condition',
      title: newRecord.title,
      value: newRecord.value || '',
      date: newRecord.date || new Date().toISOString().split('T')[0],
      notes: newRecord.notes || '',
      isOfflineData: !isOnline,
      pendingSync: !isOnline
    };

    const updatedRecords = [...healthRecords, record];
    setHealthRecords(updatedRecords);
    saveToLocalStorage(updatedRecords, vitalSigns);
    
    // Add to pending sync if offline
    if (!isOnline) {
      offlineManager.addToPendingSync(record);
    }
    
    // Reset form
    setNewRecord({
      type: 'condition',
      title: '',
      value: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddRecord(false);
  };

  // Get icon for record type
  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'vital':
        return <FaHeartbeat className="text-red-500" />;
      case 'medication':
        return <FaPrescriptionBottleAlt className="text-blue-500" />;
      case 'allergy':
        return <MdBloodtype className="text-orange-500" />;
      case 'condition':
        return <FaStethoscope className="text-purple-500" />;
      case 'vaccination':
        return <MdVaccines className="text-green-500" />;
      case 'lab_result':
        return <FaFileMedical className="text-indigo-500" />;
      case 'prescription':
        return <FaPrescriptionBottleAlt className="text-blue-600" />;
      default:
        return <BiHealth className="text-gray-500" />;
    }
  };

  return (
    <div className="m-4 space-y-6">
      {/* Header with online/offline status */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Digital Health Records</h2>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <div className="flex items-center text-green-600">
              <FaWifi className="mr-1" />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <MdSignalWifiOff className="mr-1" />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Sync status */}
      {lastSyncTime && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            Last synced: {lastSyncTime}
          </p>
        </div>
      )}

      {/* Vital Signs Quick View */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaHeartbeat className="mr-2 text-red-500" />
          Latest Vital Signs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Blood Pressure</p>
            <p className="font-semibold">{vitalSigns.bloodPressure}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Heart Rate</p>
            <p className="font-semibold">{vitalSigns.heartRate}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="font-semibold">{vitalSigns.temperature}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Weight</p>
            <p className="font-semibold">{vitalSigns.weight}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Height</p>
            <p className="font-semibold">{vitalSigns.height}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-semibold text-xs">{vitalSigns.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Add Record Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddRecord(!showAddRecord)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Record
        </button>
      </div>

      {/* Add Record Form */}
      {showAddRecord && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-200">
          <h3 className="text-lg font-semibold mb-3">Add New Health Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newRecord.type}
                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as HealthRecord['type'] })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="condition">Medical Condition</option>
                <option value="medication">Medication</option>
                <option value="allergy">Allergy</option>
                <option value="vaccination">Vaccination</option>
                <option value="lab_result">Lab Result</option>
                <option value="prescription">Prescription</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                placeholder="e.g., Blood Pressure Medication"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value/Dosage</label>
              <input
                type="text"
                value={newRecord.value}
                onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                placeholder="e.g., 10mg daily"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="Additional notes..."
                className="w-full p-2 border rounded-lg h-20"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddRecord(false)}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addHealthRecord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Record
            </button>
          </div>
        </div>
      )}

      {/* Health Records List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <FaFileMedical className="mr-2 text-blue-600" />
            Health Records
          </h3>
        </div>
        
        {healthRecords.length > 0 ? (
          <div className="divide-y">
            {healthRecords.map((record) => (
              <div key={record.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-800">{record.title}</h4>
                        {record.isOfflineData && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Offline
                          </span>
                        )}
                        {record.pendingSync && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Pending Sync
                          </span>
                        )}
                      </div>
                      {record.value && (
                        <p className="text-gray-600 mt-1">{record.value}</p>
                      )}
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                        {record.doctor && <span>Doctor: {record.doctor}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {record.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <MdLocalHospital className="mx-auto h-12 w-12 mb-2" />
            <p>No health records found</p>
            <p className="text-sm">Add your first health record to get started</p>
          </div>
        )}
      </div>

      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center">
            <MdSignalWifiOff className="text-yellow-600 mr-2" />
            <div>
              <h4 className="font-semibold text-yellow-800">You're viewing offline data</h4>
              <p className="text-sm text-yellow-700">
                Your health records are cached locally and available even without internet connection. 
                Data will sync automatically when you're back online.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalHealthRecords;