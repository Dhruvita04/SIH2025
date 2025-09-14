const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Patient } = require('../models');
require('dotenv').config();
const saltRounds = 10;

const updateInfo = async (patientUserId, patientEmail, updates) => {
    try {
        // Find the user first
        const user = await User.findOne({ 
            _id: patientUserId, 
            role: 'Patient', 
            email: patientEmail 
        });

        if (!user) {
            console.log('Patient not found');
            return false;
        }

        // Prepare user updates (exclude languages as they're handled separately)
        const userUpdates = {};
        const allowedUserFields = ['user_first_name', 'user_last_name', 'user_phone_number', 'user_gender', 'user_birth_date'];
        
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined && value !== null && value !== '' && key !== 'languages') {
                // Map the field names to match the User schema
                switch(key) {
                    case 'user_first_name':
                        userUpdates.firstName = value;
                        break;
                    case 'user_last_name':
                        userUpdates.lastName = value;
                        break;
                    case 'user_phone_number':
                        userUpdates.phoneNumber = value;
                        break;
                    case 'user_gender':
                        userUpdates.gender = value;
                        break;
                    case 'user_birth_date':
                        userUpdates.birthDate = value;
                        break;
                    default:
                        if (allowedUserFields.includes(key)) {
                            userUpdates[key] = value;
                        }
                }
            }
        }

        // Update user information if there are changes
        if (Object.keys(userUpdates).length > 0) {
            userUpdates.updatedAt = new Date();
            const updatedUser = await User.findByIdAndUpdate(
                patientUserId,
                userUpdates,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                console.log('Could not update user info');
            } else {
                console.log('User info updated', updatedUser);
            }
        } else {
            console.log('No user info provided');
        }

        // Handle languages update
        if (Array.isArray(updates.languages) && updates.languages.length > 0) {
            const validLanguages = updates.languages.filter(language => 
                language !== '' && language !== null && language !== undefined
            );
            
            if (validLanguages.length > 0) {
                // For now, we'll store languages in the user's profile or extend the Patient model
                // You can create a separate Languages collection if needed
                await User.findByIdAndUpdate(
                    patientUserId,
                    { languages: validLanguages, updatedAt: new Date() },
                    { new: true }
                );
                console.log('User languages updated to include', validLanguages);
            } else {
                console.log('Invalid languages provided');
            }
        } else {
            console.log('No languages provided');
        }

        // Return updated user info with languages
        const updatedUser = await User.findOne({ 
            _id: patientUserId, 
            role: 'Patient', 
            email: patientEmail 
        }).select('-passwordHash'); // Exclude password from result

        if (!updatedUser) {
            console.log('Could not retrieve updated patient info');
            return false;
        }

        // Format response to match original structure
        const formattedResult = [{
            user_id: updatedUser._id,
            user_first_name: updatedUser.firstName,
            user_last_name: updatedUser.lastName,
            user_email: updatedUser.email,
            user_gender: updatedUser.gender,
            user_phone_number: updatedUser.phoneNumber,
            user_birth_date: updatedUser.birthDate,
            languages: updatedUser.languages || []
        }];

        console.log('Patient info updated', formattedResult);
        return formattedResult;

    } catch (error) {
        console.error('Error updating patient info:', error);
        return false;
    }
};

const updatePassword = async (patientUserId, patientEmail, oldPassword, newPassword) => {
    try {
        // Find the user
        const user = await User.findOne({ 
            _id: patientUserId, 
            role: 'Patient', 
            email: patientEmail 
        });

        if (!user) {
            console.log('Patient not found');
            return false;
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            console.log('Old password does not match');
            return false;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        const updatedUser = await User.findByIdAndUpdate(
            patientUserId,
            { 
                passwordHash: hashedPassword, 
                updatedAt: new Date() 
            },
            { new: true }
        ).select('-passwordHash'); // Exclude password from result

        if (!updatedUser) {
            console.log('Could not update patient password');
            return false;
        }

        // Format response to match original structure
        const formattedResult = [{
            user_id: updatedUser._id,
            user_first_name: updatedUser.firstName,
            user_last_name: updatedUser.lastName,
            user_email: updatedUser.email,
            user_role: updatedUser.role
        }];

        console.log('Patient password updated', formattedResult);
        return formattedResult;

    } catch (error) {
        console.error('Error updating patient password:', error);
        return false;
    }
};

module.exports = { updateInfo, updatePassword };