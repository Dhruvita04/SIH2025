const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        }
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        trim: true
    },
    allergies: [{
        type: String,
        trim: true
    }],
    medicalHistory: [{
        condition: {
            type: String,
            required: true,
            trim: true
        },
        diagnosedDate: Date,
        notes: String
    }],
    currentMedications: [{
        medicationName: {
            type: String,
            required: true,
            trim: true
        },
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date
    }],
    height: {
        type: Number, // in cm
        min: 0
    },
    weight: {
        type: Number, // in kg
        min: 0
    },
    totalAppointments: {
        type: Number,
        default: 0
    },
    profilePicture: {
        type: String, // URL to the image
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
patientSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
// Removed duplicate index for userId; already defined as unique in schema

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
