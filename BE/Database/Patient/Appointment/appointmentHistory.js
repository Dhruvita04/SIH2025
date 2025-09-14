const mongoose = require('mongoose');
const { Appointment, Doctor, User, Patient } = require('../../models');
require('dotenv').config();

const retrievePatientAppointmentsHistory = async (patientId) => {
    try {
        const appointments = await Appointment.find({
            patientId: patientId,
            status: 'Completed'
        })
        .populate({
            path: 'patientId',
            populate: {
                path: 'userId',
                select: 'firstName lastName'
            }
        })
        .populate({
            path: 'doctorId',
            populate: {
                path: 'userId',
                select: 'firstName lastName'
            }
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
                doctor_availability_day_hour: appointment.appointmentDate,
                // Review ratings from the appointment document
                appointment_review_communication_rating: appointment.rating || 0,
                appointment_review_understanding_rating: appointment.rating || 0,
                appointment_review_providing_solutions_rating: appointment.rating || 0,
                appointment_review_commitment_rating: appointment.rating || 0
            });
        }

        console.log(result);
        return result;
    } catch (error) {
        console.error('Error retrieving patient appointment history:', error);
        return [];
    }
};

module.exports = { retrievePatientAppointmentsHistory };