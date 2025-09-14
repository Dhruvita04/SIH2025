const mongoose = require('mongoose');
const { Appointment, Doctor, Patient } = require('../../models');
require('dotenv').config();

const retrievependingappointments = async (patientId) => {
    try {
        const appointments = await Appointment.find({
            patientId: patientId,
            status: 'Scheduled' // Equivalent to 'Pending'
        });

        const result = [];
        
        for (let appointment of appointments) {
            // Get doctor details
            const doctor = await Doctor.findOne({ userId: appointment.doctorId })
                .populate('userId', 'firstName lastName');
            
            // Get patient details
            const patient = await Patient.findOne({ userId: appointment.patientId })
                .populate('userId', 'firstName lastName');

            result.push({
                appointment_patient_id: appointment.patientId,
                appointment_doctor_id: appointment.doctorId,
                appointment_type: appointment.type,
                appointment_id: appointment._id,
                appointment_duration: '30', // Default duration
                appointment_complaint: appointment.symptoms,
                appointment_parent_reference: appointment.parentAppointmentId,
                appointment_settings_type: appointment.notes?.includes('Onsite') ? 'Onsite' : 'Online',
                patient_first_name: patient?.userId?.firstName || '',
                patient_last_name: patient?.userId?.lastName || '',
                doctor_first_name: doctor?.userId?.firstName || '',
                doctor_last_name: doctor?.userId?.lastName || '',
                doctor_specialization: doctor?.specialization || '',
                doctor_availability_day_hour: appointment.appointmentDate
            });
        }

        return result;
    } catch (error) {
        console.error('Error retrieving pending appointments:', error);
        return [];
    }
};

module.exports = { retrievependingappointments };