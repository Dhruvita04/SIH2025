const mongoose = require('mongoose');
const { User, Patient, Doctor, Appointment } = require('../models');
require('dotenv').config();

const retrievePatientInfo = async (id) => {
  try {
    const patient = await Patient.findOne({ userId: id })
      .populate('userId', 'email phoneNumber gender birthDate firstName lastName');
    
    if (patient) {
      console.log('Patient info found', patient);
      // Return in format similar to original
      return [{
        user_email: patient.userId.email,
        user_phone_number: patient.userId.phoneNumber,
        user_gender: patient.userId.gender,
        user_birth_date: patient.userId.birthDate,
        user_first_name: patient.userId.firstName,
        user_last_name: patient.userId.lastName,
        languages: [] // TODO: Add languages support if needed
      }];
    }
    console.log('Patient info not found');
    return false;
  } catch (error) {
    console.error('Error retrieving patient info:', error);
    return false;
  }
};

const getPatientRequests = async (patientId) => {
  try {
    const appointments = await Appointment.find({
      patientId: patientId,
      status: { $in: ['Scheduled', 'Cancelled'] } // Equivalent to Pending/Declined
    })
    .populate('patientId', 'firstName lastName')
    .populate('doctorId', 'firstName lastName');

    return appointments.map(appointment => ({
      appointment_patient_id: appointment.patientId._id,
      appointment_doctor_id: appointment.doctorId._id,
      appointment_type: appointment.type,
      appointment_duration: '30', // Default duration
      appointment_complaint: appointment.symptoms,
      appointment_parent_reference: appointment.parentAppointmentId,
      appointment_settings_type: appointment.type,
      patient_first_name: appointment.patientId.firstName,
      patient_last_name: appointment.patientId.lastName,
      doctor_first_name: appointment.doctorId.firstName,
      doctor_last_name: appointment.doctorId.lastName,
      doctor_availability_day_hour: appointment.appointmentDate
    }));
  } catch (error) {
    console.error('Error getting patient requests:', error);
    return [];
  }
};

const retrievePatientAppointments = async (patientId) => {
  try {
    const appointments = await Appointment.find({
      patientId: patientId,
      status: 'Confirmed' // Equivalent to Approved
    })
    .populate({
      path: 'patientId',
      select: 'firstName lastName'
    })
    .populate({
      path: 'doctorId',
      select: 'firstName lastName',
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
      
      result.push({
        appointment_patient_id: appointment.patientId._id,
        appointment_doctor_id: appointment.doctorId,
        appointment_type: appointment.type,
        appointment_id: appointment._id,
        appointment_duration: '30', // Default duration
        appointment_complaint: appointment.symptoms,
        appointment_parent_reference: appointment.parentAppointmentId,
        appointment_settings_type: appointment.type,
        patient_first_name: appointment.patientId.firstName,
        patient_last_name: appointment.patientId.lastName,
        doctor_first_name: doctor?.userId?.firstName || '',
        doctor_last_name: doctor?.userId?.lastName || '',
        doctor_specialization: doctor?.specialization || '',
        doctor_availability_day_hour: appointment.appointmentDate
      });
    }

    console.log(result);
    return result;
  } catch (error) {
    console.error('Error retrieving patient appointments:', error);
    return [];
  }
};

const getDoctorDetails = async (doctorId) => {
  try {
    const doctor = await Doctor.findOne({ userId: doctorId })
      .populate('userId', 'firstName lastName');
    
    if (doctor) {
      return {
        user_first_name: doctor.userId.firstName,
        user_last_name: doctor.userId.lastName,
        doctor_specialization: doctor.specialization
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting doctor details:', error);
    return null;
  }
};

const getDoctorClinicLocation = async (doctorId) => {
  try {
    const doctor = await Doctor.findOne({ userId: doctorId });
    
    // Since clinic location isn't in new schema, return null or add it to bio
    return null;
  } catch (error) {
    console.error('Error getting doctor clinic location:', error);
    return null;
  }
};

const retrievePatientDoctors = async (id, email) => {
  try {
    // Find patient and their associated doctors through appointments
    const patient = await Patient.findOne({ userId: id })
      .populate('userId', 'email phoneNumber gender birthDate firstName lastName');
    
    if (!patient || patient.userId.email !== email) {
      console.log('Patient doctors not found');
      return false;
    }

    // Get doctors from patient's appointments
    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .distinct('doctorId');

    const doctors = await Doctor.find({ _id: { $in: appointments } })
      .populate('userId', 'firstName lastName');

    const result = doctors.map(doctor => ({
      user_email: patient.userId.email,
      user_phone_number: patient.userId.phoneNumber,
      user_gender: patient.userId.gender,
      user_birth_year: patient.userId.birthDate.getFullYear(),
      user_first_name: patient.userId.firstName,
      user_last_name: patient.userId.lastName,
      doctor_specialization: doctor.specialization,
      doctor_user_id_reference: doctor.userId._id
    }));

    if (result.length) {
      console.log('Patient doctors found', result);
      return result;
    }
    console.log('Patient doctors not found');
    return false;
  } catch (error) {
    console.error('Error retrieving patient doctors:', error);
    return false;
  }
};

const retrievePatientReviews = async (id, email) => {
  try {
    const patient = await Patient.findOne({ userId: id })
      .populate('userId', 'email phoneNumber gender birthDate firstName lastName');
    
    if (!patient || patient.userId.email !== email) {
      console.log('Patient reviews not found');
      return false;
    }

    // Get appointments with reviews (ratings)
    const appointments = await Appointment.find({ 
      patientId: patient._id,
      rating: { $exists: true }
    });

    const result = appointments.map(appointment => ({
      user_email: patient.userId.email,
      user_phone_number: patient.userId.phoneNumber,
      user_gender: patient.userId.gender,
      user_birth_year: patient.userId.birthDate.getFullYear(),
      user_first_name: patient.userId.firstName,
      user_last_name: patient.userId.lastName,
      review_rating: appointment.rating,
      review_comment: appointment.review,
      review_appointment_id: appointment._id
    }));

    if (result.length) {
      console.log('Patient reviews found', result);
      return result;
    }
    console.log('Patient reviews not found');
    return false;
  } catch (error) {
    console.error('Error retrieving patient reviews:', error);
    return false;
  }
};

module.exports = {
  retrievePatientInfo,
  retrievePatientAppointments,
  retrievePatientDoctors,
  retrievePatientReviews,
  getPatientRequests,
  getDoctorDetails,
  getDoctorClinicLocation,
};
