const mongoose = require('mongoose');
const { Appointment, Doctor, Patient } = require('../../models');
require('dotenv').config();

const createAppointmentEntry = async (time_slot_code, patientId, doctor_id, complaint, duration, appointment_type, appointment_date) => {
  try {
    // Determine the appointment_settings_type based on the time_slot_code
    const appointment_settings_type = time_slot_code.endsWith('S') ? 'Onsite' : 'Online';

    // Create new appointment
    const appointment = new Appointment({
      patientId: patientId,
      doctorId: doctor_id,
      appointmentDate: appointment_date,
      appointmentTime: time_slot_code,
      type: appointment_type,
      symptoms: complaint,
      status: 'Scheduled', // Equivalent to 'Pending'
      fee: 0, // Will be set based on doctor's consultation fee
      notes: `Duration: ${duration} minutes, Type: ${appointment_settings_type}`
    });

    // Get doctor's consultation fee
    const doctor = await Doctor.findOne({ userId: doctor_id });
    if (doctor) {
      appointment.fee = doctor.consultationFee;
    }

    const savedAppointment = await appointment.save();

    // Update appointment counts
    await Patient.findOneAndUpdate(
      { userId: patientId },
      { $inc: { totalAppointments: 1 } }
    );

    await Doctor.findOneAndUpdate(
      { userId: doctor_id },
      { $inc: { totalAppointments: 1 } }
    );

    return savedAppointment._id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

module.exports = { createAppointmentEntry };
