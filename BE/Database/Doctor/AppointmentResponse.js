const { Appointment } = require('../models/Appointment');

const acceptAppointment = async (appointmentId) => {
    try {
        await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Approved' }
        );
        return true;
    } catch (error) {
        console.error('Error accepting appointment:', error);
        return false;
    }
};

const declineAppointment = async (appointmentId) => {
    try {
        await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: 'Declined' }
        );
        return true;
    } catch (error) {
        console.error('Error declining appointment:', error);
        return false;
    }
};
  
  module.exports = { acceptAppointment, declineAppointment };