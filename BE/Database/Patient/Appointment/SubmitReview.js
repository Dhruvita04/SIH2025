const mongoose = require('mongoose');
const { Appointment, Doctor } = require('../../models');
require('dotenv').config();

const SubmitReview = async (appointment_id, communication_rating, understanding_rating, providing_solution_rating, commitment_rating) => {
  try {
    console.log(appointment_id, communication_rating, understanding_rating, providing_solution_rating, commitment_rating);

    // Calculate average rating
    const totalRating = (
      parseFloat(communication_rating) + 
      parseFloat(understanding_rating) + 
      parseFloat(providing_solution_rating) + 
      parseFloat(commitment_rating)
    ) / 4;

    // Update the appointment with the review
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment_id,
      {
        rating: Math.round(totalRating * 10) / 10, // Round to 1 decimal place
        review: `Communication: ${communication_rating}, Understanding: ${understanding_rating}, Solutions: ${providing_solution_rating}, Commitment: ${commitment_rating}`
      },
      { new: true }
    );

    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }

    console.log('Review submitted:', updatedAppointment);
    return {
      appointment_review_id: updatedAppointment._id,
      rating: updatedAppointment.rating
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

const RetrieveDoctorRating = async (doctorID) => {
  try {
    const doctor = await Doctor.findOne({ userId: doctorID });
    
    if (!doctor || doctor.totalReviews === 0) {
      return null;
    }

    return {
      doctor_rating: doctor.rating,
      review_count: doctor.totalReviews
    };
  } catch (error) {
    console.error('Error retrieving doctor rating:', error);
    throw error;
  }
};

const NewDoctorRating = async (doctorID, newRating, newReview_Count) => {
  try {
    console.log(doctorID, newRating);

    // Update the doctor's rating and review count
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: doctorID },
      {
        rating: newRating,
        totalReviews: newReview_Count
      },
      { new: true }
    );

    if (!updatedDoctor) {
      throw new Error('Doctor not found');
    }

    return updatedDoctor.rating;
  } catch (error) {
    console.error('Error updating doctor rating:', error);
    throw error;
  }
};

module.exports = { SubmitReview, RetrieveDoctorRating, NewDoctorRating };
