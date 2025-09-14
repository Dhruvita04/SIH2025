const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    documentType: {
        type: String,
        enum: ['Lab Report', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Medical Certificate', 'Other'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
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
medicalDocumentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
medicalDocumentSchema.index({ patientId: 1 });
medicalDocumentSchema.index({ doctorId: 1 });
medicalDocumentSchema.index({ documentType: 1 });
medicalDocumentSchema.index({ uploadDate: -1 });

const MedicalDocument = mongoose.model('MedicalDocument', medicalDocumentSchema);

module.exports = MedicalDocument;
