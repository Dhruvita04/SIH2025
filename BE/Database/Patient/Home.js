const mongoose = require('mongoose');
const { User, Doctor } = require('../models');
require('dotenv').config();

const retrievePatient = async (id, email) => {
    try {
        const user = await User.findOne({
            _id: id,
            email: email.toLowerCase(),
            role: 'Patient'
        });

        if (user) {
            console.log('User found', user);
            // Return in array format to match original
            return [{
                user_id: user._id,
                user_email: user.email,
                user_first_name: user.firstName,
                user_last_name: user.lastName,
                user_phone_number: user.phoneNumber,
                user_gender: user.gender,
                user_role: user.role,
                user_birth_date: user.birthDate
            }];
        }
        console.log('No user found');
        return false;
    } catch (error) {
        console.error('Error retrieving patient:', error);
        return false;
    }
};

const retrieveDoctors = async () => {
    try {
        const doctors = await Doctor.find({ accountState: 'Approved' })
            .populate('userId', 'firstName lastName gender')
            .select('specialization consultationFee rating totalReviews profilePicture bio');

        if (doctors.length) {
            const result = doctors.map(doctor => ({
                user_id: doctor.userId._id,
                user_first_name: doctor.userId.firstName,
                user_last_name: doctor.userId.lastName,
                user_gender: doctor.userId.gender,
                doctor_specialization: doctor.specialization,
                doctor_country: 'India', // Default value
                doctor_thirty_min_price: doctor.consultationFee,
                doctor_sixty_min_price: doctor.consultationFee * 2,
                doctor_image: doctor.profilePicture,
                doctor_rating: doctor.rating,
                review_count: doctor.totalReviews,
                doctor_interest_name: doctor.bio ? doctor.bio.split('Interests:')[1]?.split('|')[0]?.trim() : '',
                language: 'English' // Default language
            }));

            console.log('Doctor info found', result);
            return result;
        }

        console.log('Doctor info not found');
        return false;
    } catch (error) {
        console.error('Error retrieving doctors:', error);
        return false;
    }
};

module.exports = { retrievePatient, retrieveDoctors };