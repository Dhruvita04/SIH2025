const express = require('express');
const router = express.Router();
const patientRecordsController = require('../../Controllers/Doctor/PatientRecords');
const { tokenAuthentication } = require('../../Middleware/User/Authentication');

// Get all patients accessible to the doctor
router.get('/patients', tokenAuthentication, patientRecordsController.getAllPatients);

// Search patients by name, email, or phone
router.get('/patients/search', tokenAuthentication, patientRecordsController.searchPatients);

// Get specific patient's records and health data
router.get('/patients/:patientId/records', tokenAuthentication, patientRecordsController.getPatientRecords);

module.exports = router;