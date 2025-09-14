const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Optional address/contact info from signup form
    country: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    accountState: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
        default: 'Pending'
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    // Structured arrays to hold form data
    certificates: [{
        name: { type: String, trim: true },
        authority: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    experiences: [{
        title: { type: String, trim: true },
        firm: { type: String, trim: true },
        department: { type: String, trim: true },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    interests: [{
        name: { type: String, trim: true },
        category: { type: String, trim: true }
    }],
    languages: [{ type: String, trim: true }],
    profilePicture: {
        type: String, // URL to the image
        default: null
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalAppointments: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    availability: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String,
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
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
doctorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
// Removed duplicate index for userId; already defined as unique in schema
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ accountState: 1 });
doctorSchema.index({ rating: -1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
