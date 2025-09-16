const mongoose = require('mongoose');
const { User, Doctor, Patient, Notification } = require('./models');
require('dotenv').config();

const retrieveUser = async (email) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            console.log('User found:', user);
            return [user]; // Return array to match original format
        }
        console.log('User not found');
        return false;
    } catch (error) {
        console.error('Error retrieving user:', error);
        return false;
    }
};

const retrieveUserState = async (userId, userRole) => {
    try {
        if (userRole === 'Doctor') {
            console.log('User is a doctor');
            const doctor = await Doctor.findOne({ userId: userId });
            if (doctor) {
                return doctor.accountState;
            }
            return 'Doctor state not found';
        } else if (userRole === 'Patient') {
            console.log('User is a patient');
            // For patients, we can assume they're always active unless specified otherwise
            const patient = await Patient.findOne({ userId: userId });
            if (patient) {
                return 'Active'; // Patients don't have account states in the new schema
            }
            return 'Patient state not found';
        } else if (userRole === 'Admin') {
            console.log('User is an admin');
            return 'Active'; // Assuming admin accounts are always active
        } else {
            console.log('User role not recognized');
            return false;
        }
    } catch (error) {
        console.error('Error retrieving user state:', error);
        return false;
    }
};

const getUnreadNotificationCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: userId, 
            isRead: false 
        });
        return count;
    } catch (error) {
        console.error('Error counting unread notifications:', error);
        return 0; // Return 0 in case of an error
    }
};

const updateDoctorState = async (userId, newState) => {
    try {
        const result = await Doctor.updateOne(
            { userId: userId },
            { accountState: newState }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`Doctor state updated to ${newState} for userId: ${userId}`);
            return true;
        } else {
            console.log(`No doctor found with userId: ${userId} or state was already ${newState}`);
            return false;
        }
    } catch (error) {
        console.error('Error updating doctor state:', error);
        return false;
    }
};

module.exports = { retrieveUser, retrieveUserState, getUnreadNotificationCount, updateDoctorState };