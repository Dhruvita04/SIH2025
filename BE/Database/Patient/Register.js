const mongoose = require('mongoose');
const { User, Patient } = require('../models');
require('dotenv').config();

const checkUserEmail = async (email) => {
    try {
        // Check email uniqueness regardless of role (email is unique in schema)
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            console.log('User with email already exists:', user.email);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking user email:', error);
        return false;
    }
};

const insertPatient = async (userData) => {
    let session = null;
    let useTxn = false;

    try {
        // Try to start a session/transaction; if not supported, fallback
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            useTxn = true;
        } catch (txnErr) {
            useTxn = false;
            if (session) session.endSession();
            session = null;
            console.warn('MongoDB transactions not available, proceeding without transaction:', txnErr.message);
        }

        // Create user first
        const user = new User({
            firstName: userData.fName,
            lastName: userData.lName,
            email: userData.email.toLowerCase(),
            phoneNumber: userData.phone,
            gender: userData.gender,
            role: userData.role,
            passwordHash: userData.password,
            birthDate: userData.birthDate
        });

        const savedUser = useTxn ? await user.save({ session }) : await user.save();

        if (!savedUser) {
            console.log('User not added');
            if (useTxn && session) await session.abortTransaction();
            return false;
        }

        // Create patient profile
        const patient = new Patient({
            userId: savedUser._id,
            emergencyContact: {
                name: userData.emergencyContactName || '',
                phoneNumber: userData.emergencyContactPhone || '',
                relationship: userData.emergencyContactRelation || ''
            },
            bloodGroup: userData.bloodGroup || null,
            allergies: userData.allergies || [],
            height: userData.height || null,
            weight: userData.weight || null
        });

        const savedPatient = useTxn ? await patient.save({ session }) : await patient.save();

        if (!savedPatient) {
            console.log('Patient not added');
            if (useTxn && session) await session.abortTransaction();
            return false;
        }

        if (useTxn && session) {
            await session.commitTransaction();
        }

        // Return combined user and patient info
        const populatedPatient = await Patient.findById(savedPatient._id)
            .populate('userId');

        if (populatedPatient) {
            console.log('User and patient saved:', {
                userId: populatedPatient.userId._id.toString(),
                patientId: populatedPatient._id.toString(),
                email: populatedPatient.userId.email
            });
            return {
                user_id: populatedPatient.userId._id,
                user_first_name: populatedPatient.userId.firstName,
                user_last_name: populatedPatient.userId.lastName,
                user_email: populatedPatient.userId.email,
                user_phone_number: populatedPatient.userId.phoneNumber,
                user_gender: populatedPatient.userId.gender,
                user_role: populatedPatient.userId.role,
                user_birth_date: populatedPatient.userId.birthDate,
                patient_wallet: 0 // Default wallet value
            };
        }

        console.log('Combined user and patient info not found');
        return false;

    } catch (error) {
        if (session && session.inTransaction()) {
            try { await session.abortTransaction(); } catch (_) {}
        }
        console.error('Error inserting patient:', error);
        console.error('Error details:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        return false;
    } finally {
        if (session) session.endSession();
    }
};

module.exports = { checkUserEmail, insertPatient };