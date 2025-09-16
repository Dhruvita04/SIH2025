const database = require('../../Database/Doctor/PatientRecords');
const { AppError } = require("../../Utilities");
const { catchAsyncError } = require("../../Utilities");

// Get all patients accessible to the doctor
exports.getAllPatients = catchAsyncError(async (req, res, next) => {
  const doctorId = req.id; // From token authentication
  
  try {
    const patients = await database.getAllPatients(doctorId);
    
    return res.status(200).json({
      status: "success",
      ok: true,
      patients,
    });
  } catch (error) {
    console.error('Error retrieving patients:', error);
    return res.status(500).json({ 
      status: "error",
      message: 'Internal server error' 
    });
  }
});

// Get specific patient details and health records
exports.getPatientRecords = catchAsyncError(async (req, res, next) => {
  const doctorId = req.id; // From token authentication
  const { patientId } = req.params;
  
  if (!patientId) {
    return next(new AppError("Patient ID is required", 400));
  }
  
  try {
    // First check if doctor has access to this patient
    const hasAccess = await database.checkDoctorPatientAccess(doctorId, patientId);
    if (!hasAccess) {
      return next(new AppError("Access denied to this patient's records", 403));
    }
    
    // Get patient basic info
    const patientInfo = await database.getPatientInfo(patientId);
    if (!patientInfo) {
      return next(new AppError("Patient not found", 404));
    }
    
    // Get patient's health records
    const healthRecords = await database.getPatientHealthRecords(patientId);
    
    // Get appointment history between this doctor and patient
    const appointmentHistory = await database.getDoctorPatientAppointments(doctorId, patientId);
    
    return res.status(200).json({
      status: "success",
      ok: true,
      data: {
        patient: patientInfo,
        healthRecords: healthRecords || [],
        appointmentHistory: appointmentHistory || []
      }
    });
  } catch (error) {
    console.error('Error retrieving patient records:', error);
    return res.status(500).json({ 
      status: "error",
      message: 'Internal server error' 
    });
  }
});

// Search patients by name, email, or phone
exports.searchPatients = catchAsyncError(async (req, res, next) => {
  const doctorId = req.id; // From token authentication
  const { searchTerm } = req.query;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return next(new AppError("Search term must be at least 2 characters", 400));
  }
  
  try {
    const patients = await database.searchPatients(doctorId, searchTerm.trim());
    
    return res.status(200).json({
      status: "success",
      ok: true,
      patients,
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    return res.status(500).json({ 
      status: "error",
      message: 'Internal server error' 
    });
  }
});