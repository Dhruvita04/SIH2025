const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    role: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor', 'Admin']
    },
    passwordHash: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    pushTokens: [{
        type: String,
        trim: true
    }],
    languages: [{
        type: String,
        trim: true
    }]
});

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
// Removed duplicate index for email; already defined as unique in schema
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
