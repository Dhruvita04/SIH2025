const { MongoClient } = require('mongodb');
const { query } = require('express');

let db;

// Initialize database connection
const initDB = async () => {
  if (!db) {
    const uri = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI;
    if (!uri) {
      console.error('Missing MongoDB connection string: set MONGODB_CONNECTION_STRING or MONGODB_URI in BE/.env');
      throw new Error('MongoDB connection string not configured');
    }
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db();
  }
  return db;
};

// Get all patients that have had appointments with this doctor
const getAllPatients = async (doctorId) => {
  try {
    const database = await initDB();
    
    // Get patients who have had appointments with this doctor
    const appointments = await database.collection('appointments').find({
      doctor_id: doctorId,
      appointment_status: { $in: ['Completed', 'Scheduled', 'InProgress'] }
    }).toArray();
    
    // Get unique patient IDs
    const patientIds = [...new Set(appointments.map(apt => apt.patient_id))];
    
    if (patientIds.length === 0) {
      return [];
    }
    
    // Get patient details
    const patients = await database.collection('users').find({
      _id: { $in: patientIds },
      role: 'Patient'
    }).project({
      _id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      phoneNumber: 1,
      gender: 1,
      dateOfBirth: 1,
      profilePicture: 1
    }).toArray();
    
    // Add last appointment date for each patient
    const patientsWithLastVisit = patients.map(patient => {
      const patientAppointments = appointments.filter(apt => apt.patient_id.toString() === patient._id.toString());
      const lastAppointment = patientAppointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))[0];
      
      return {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phoneNumber,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        profilePicture: patient.profilePicture,
        lastVisit: lastAppointment ? lastAppointment.appointment_date : null,
        totalAppointments: patientAppointments.length
      };
    });
    
    return patientsWithLastVisit;
  } catch (error) {
    console.error('Error getting all patients:', error);
    throw error;
  }
};

// Check if doctor has access to patient records
const checkDoctorPatientAccess = async (doctorId, patientId) => {
  try {
    const database = await initDB();
    
    // Check if there's at least one appointment between doctor and patient
    const appointment = await database.collection('appointments').findOne({
      doctor_id: doctorId,
      patient_id: patientId
    });
    
    return !!appointment;
  } catch (error) {
    console.error('Error checking doctor-patient access:', error);
    return false;
  }
};

// Get patient basic information
const getPatientInfo = async (patientId) => {
  try {
    const database = await initDB();
    
    const patient = await database.collection('users').findOne(
      { _id: patientId, role: 'Patient' },
      {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneNumber: 1,
          gender: 1,
          dateOfBirth: 1,
          profilePicture: 1,
          emergencyContact: 1,
          address: 1,
          bloodType: 1,
          allergies: 1,
          medicalConditions: 1
        }
      }
    );
    
    if (patient) {
      return {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phoneNumber,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        profilePicture: patient.profilePicture,
        emergencyContact: patient.emergencyContact,
        address: patient.address,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
        medicalConditions: patient.medicalConditions || []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting patient info:', error);
    throw error;
  }
};

// Get patient's health records
const getPatientHealthRecords = async (patientId) => {
  try {
    const database = await initDB();
    
    // Get medical documents
    const medicalDocs = await database.collection('medical_documents').find({
      patient_id: patientId
    }).toArray();
    
    // Get prescriptions
    const prescriptions = await database.collection('prescriptions').find({
      patient_id: patientId
    }).toArray();
    
    // Get appointment results/diagnoses
    const appointmentResults = await database.collection('appointment_results').find({
      patient_id: patientId
    }).toArray();
    
    // Combine all records
    const healthRecords = [];
    
    // Add medical documents
    medicalDocs.forEach(doc => {
      healthRecords.push({
        id: doc._id,
        type: 'medical_document',
        title: doc.document_name || 'Medical Document',
        date: doc.upload_date,
        fileUrl: doc.file_url,
        fileType: doc.file_type,
        notes: doc.notes
      });
    });
    
    // Add prescriptions
    prescriptions.forEach(prescription => {
      healthRecords.push({
        id: prescription._id,
        type: 'prescription',
        title: 'Prescription',
        date: prescription.created_date,
        medications: prescription.medications,
        doctor: prescription.doctor_name,
        notes: prescription.notes
      });
    });
    
    // Add appointment results
    appointmentResults.forEach(result => {
      healthRecords.push({
        id: result._id,
        type: 'diagnosis',
        title: result.diagnosis || 'Appointment Result',
        date: result.created_date,
        diagnosis: result.diagnosis,
        treatment: result.treatment_plan,
        doctor: result.doctor_name,
        notes: result.notes
      });
    });
    
    // Sort by date (newest first)
    healthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return healthRecords;
  } catch (error) {
    console.error('Error getting patient health records:', error);
    throw error;
  }
};

// Get appointment history between doctor and patient
const getDoctorPatientAppointments = async (doctorId, patientId) => {
  try {
    const database = await initDB();
    
    const appointments = await database.collection('appointments').find({
      doctor_id: doctorId,
      patient_id: patientId
    }).sort({ appointment_date: -1 }).toArray();
    
    return appointments.map(apt => ({
      id: apt._id,
      date: apt.appointment_date,
      status: apt.appointment_status,
      type: apt.appointment_type || 'Consultation',
      notes: apt.notes,
      diagnosis: apt.diagnosis,
      treatmentPlan: apt.treatment_plan
    }));
  } catch (error) {
    console.error('Error getting doctor-patient appointments:', error);
    throw error;
  }
};

// Search patients by name, email, or phone
const searchPatients = async (doctorId, searchTerm) => {
  try {
    const database = await initDB();
    
    // First get all patients this doctor has access to
    const allPatients = await getAllPatients(doctorId);
    
    // Filter by search term
    const filteredPatients = allPatients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = patient.email ? patient.email.toLowerCase() : '';
      const phone = patient.phone ? patient.phone.toString() : '';
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || 
             email.includes(search) || 
             phone.includes(search);
    });
    
    return filteredPatients;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

module.exports = {
  getAllPatients,
  checkDoctorPatientAccess,
  getPatientInfo,
  getPatientHealthRecords,
  getDoctorPatientAppointments,
  searchPatients
};