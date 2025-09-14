const mongoose = require('mongoose');
const { Doctor, Appointment } = require('../../models');
require('dotenv').config();

const getDoctorTimeslots = async (doctorId) => {
    try {
      // Get doctor's availability from the doctor document
      const doctor = await Doctor.findOne({ userId: doctorId });
      
      if (!doctor || !doctor.availability || doctor.availability.length === 0) {
        return '';
      }

      // Convert doctor availability to timeslot format
      const timeslotCodes = doctor.availability
        .filter(slot => slot.isAvailable)
        .map(slot => {
          // Generate timeslot codes based on day and time
          const dayCode = slot.day.substring(0, 3).toUpperCase(); // MON, TUE, etc.
          const timeCode = slot.startTime.replace(':', ''); // 0900, 1400, etc.
          return `${dayCode}_${timeCode}_O`; // O for Online, add S for Onsite if needed
        });
      
      return timeslotCodes.join(',');
    } catch (error) {
      console.error('Error getting doctor timeslots:', error);
      return '';
    }
};

const getDoctorAvailabilityDetails = async (doctorId) => {
    try {
        // Get existing appointments for this doctor
        const appointments = await Appointment.find({
          doctorId: doctorId,
          status: { $in: ['Confirmed', 'Scheduled'] } // Equivalent to 'Approved', 'Pending'
        }).select('appointmentDate appointmentTime');

        // Convert to the format expected by the frontend
        const availableSlots = appointments.map(appointment => {
          // Combine date and time into a single datetime string
          const dateTime = new Date(appointment.appointmentDate);
          const timeString = appointment.appointmentTime || '09:00';
          
          // Format: "YYYY-MM-DD HH:MM:SS"
          return `${dateTime.toISOString().split('T')[0]} ${timeString}:00`;
        });

        return availableSlots;
    } catch (error) {
        console.error('Error getting doctor availability:', error);
        return [];
    }
};

module.exports = { getDoctorAvailabilityDetails, getDoctorTimeslots };